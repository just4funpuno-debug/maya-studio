"use server";

import { requiereAccesoProducto } from "@/lib/auth/permisos";
import { generarPieza, type GenerarPiezaResult } from "@/lib/motor/generar";
import { verificarLimiteGeneracion } from "@/lib/motor/limite-generaciones";
import { avanzarCalendarioProducto } from "@/lib/productos/avanzar-calendario";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type AprobarPiezaResult =
  | {
      ok: true;
      nuevoDia: number;
      nuevoCiclo: number;
      cambioCiclo: boolean;
      cicloCompletado: number | null;
    }
  | { ok: false; error: string };

export async function generarPiezaAction(
  productoId: string
): Promise<GenerarPiezaResult> {
  const auth = await requiereAccesoProducto(productoId);
  if (!auth.ok) return { ok: false, error: auth.error };

  const limite = await verificarLimiteGeneracion();
  if (!limite.ok) return { ok: false, error: limite.error };

  const supabase = await createClient();
  const { data: producto, error } = await supabase
    .from("productos")
    .select("dia_actual")
    .eq("id", productoId)
    .single();

  if (error || !producto) {
    return { ok: false, error: "Producto no encontrado." };
  }

  return generarPieza(productoId, producto.dia_actual);
}

function texto(val: unknown): string | null {
  return typeof val === "string" && val.trim() ? val.trim() : null;
}

function numero(val: unknown): number | null {
  return typeof val === "number" ? val : null;
}

function memoriaDePieza(pieza: Record<string, unknown>) {
  const mem = pieza.memoria;
  if (mem && typeof mem === "object" && !Array.isArray(mem)) {
    const m = mem as Record<string, unknown>;
    return {
      hook: texto(m.hook) ?? texto(pieza.hook),
      angulo: texto(m.angulo) ?? texto(pieza.angulo),
      keyword: texto(m.keyword) ?? texto(pieza.keyword_seo) ?? texto(pieza.keyword),
    };
  }
  return {
    hook: texto(pieza.hook),
    angulo: texto(pieza.angulo),
    keyword: texto(pieza.keyword_seo) ?? texto(pieza.keyword),
  };
}

export async function aprobarPiezaAction(
  productoId: string,
  pieza: Record<string, unknown>
): Promise<AprobarPiezaResult> {
  const auth = await requiereAccesoProducto(productoId);
  if (!auth.ok) return { ok: false, error: auth.error };

  const supabase = await createClient();

  const { data: producto, error: productoError } = await supabase
    .from("productos")
    .select("dia_actual, ciclo_actual")
    .eq("id", productoId)
    .single();

  if (productoError || !producto) {
    return { ok: false, error: "Producto no encontrado." };
  }

  const memoria = memoriaDePieza(pieza);
  const dia = numero(pieza.dia) ?? producto.dia_actual;
  const ciclo = numero(pieza.ciclo) ?? producto.ciclo_actual;

  const { error: insertError } = await supabase.from("piezas").insert({
    producto_id: productoId,
    dia,
    ciclo,
    formato: texto(pieza.formato),
    tipo_contenido: texto(pieza.tipo_contenido),
    hook: memoria.hook,
    angulo: memoria.angulo,
    keyword: memoria.keyword,
    contenido_completo: pieza,
    estado: "aprobado",
  });

  if (insertError) {
    return { ok: false, error: insertError.message };
  }

  const avance = avanzarCalendarioProducto({
    dia_actual: producto.dia_actual,
    ciclo_actual: producto.ciclo_actual,
  });

  const { error: updateError } = await supabase
    .from("productos")
    .update({
      dia_actual: avance.dia_actual,
      ciclo_actual: avance.ciclo_actual,
    })
    .eq("id", productoId);

  if (updateError) {
    return { ok: false, error: updateError.message };
  }

  revalidatePath(`/productos/${productoId}/generar`);
  revalidatePath("/productos");

  return {
    ok: true,
    nuevoDia: avance.dia_actual,
    nuevoCiclo: avance.ciclo_actual,
    cambioCiclo: avance.cambioCiclo,
    cicloCompletado: avance.cicloCompletado,
  };
}
