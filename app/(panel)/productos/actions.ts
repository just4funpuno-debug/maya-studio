"use server";

import { requiereAdmin } from "@/lib/auth/requiere-admin";
import { borrarArchivosProducto } from "@/lib/storage/borrar-archivos-producto";
import { createClient } from "@/lib/supabase/server";
import { VERSION_PROMPT_POR_DEFECTO } from "@/prompts/versiones";
import { revalidatePath } from "next/cache";

export type CrearProductoResult =
  | { ok: true }
  | { ok: false; error: string };

export type EliminarProductoResult =
  | { ok: true }
  | { ok: false; error: string };

function revalidarTrasEliminarProducto() {
  revalidatePath("/productos");
  revalidatePath("/generar");
  revalidatePath("/calendario");
  revalidatePath("/");
  revalidatePath("/usuarios");
}

export async function eliminarProductoAction(
  productoId: string,
  nombreConfirmacion: string
): Promise<EliminarProductoResult> {
  const auth = await requiereAdmin();
  if (!auth.ok) return { ok: false, error: auth.error };

  const id = productoId.trim();
  if (!id) {
    return { ok: false, error: "Producto no válido." };
  }

  const supabase = await createClient();

  const { data: producto, error: fetchError } = await supabase
    .from("productos")
    .select("id, nombre")
    .eq("id", id)
    .maybeSingle();

  if (fetchError) {
    return { ok: false, error: fetchError.message };
  }

  if (!producto) {
    return { ok: false, error: "No se encontró el producto." };
  }

  if (nombreConfirmacion.trim() !== producto.nombre) {
    return {
      ok: false,
      error: "El nombre escrito no coincide con el del producto.",
    };
  }

  const storageResult = await borrarArchivosProducto(supabase, id);
  if (!storageResult.ok) {
    return storageResult;
  }

  const { error: deleteError } = await supabase
    .from("productos")
    .delete()
    .eq("id", id);

  if (deleteError) {
    return { ok: false, error: deleteError.message };
  }

  revalidarTrasEliminarProducto();
  return { ok: true };
}

export type PublicoProducto = "unisex" | "hombres" | "mujeres";

const PUBLICOS_VALIDOS: PublicoProducto[] = ["unisex", "hombres", "mujeres"];

export async function crearProducto(
  nombre: string,
  documento_maestro: string,
  publico?: PublicoProducto
): Promise<CrearProductoResult> {
  const auth = await requiereAdmin();
  if (!auth.ok) return { ok: false, error: auth.error };

  const nombreLimpio = nombre.trim();

  if (!nombreLimpio) {
    return { ok: false, error: "El nombre del producto es obligatorio." };
  }

  const publicoFinal = publico && PUBLICOS_VALIDOS.includes(publico) ? publico : "unisex";

  const supabase = await createClient();
  const { error } = await supabase.from("productos").insert({
    nombre: nombreLimpio,
    documento_maestro: documento_maestro.trim() || null,
    version_prompt: VERSION_PROMPT_POR_DEFECTO,
    publico: publicoFinal,
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath("/productos");
  return { ok: true };
}

export type ActualizarPublicoResult =
  | { ok: true }
  | { ok: false; error: string };

export async function actualizarPublico(
  productoId: string,
  publico: PublicoProducto
): Promise<ActualizarPublicoResult> {
  const auth = await requiereAdmin();
  if (!auth.ok) return { ok: false, error: auth.error };

  if (!PUBLICOS_VALIDOS.includes(publico)) {
    return { ok: false, error: "Valor de público no válido." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("productos")
    .update({ publico })
    .eq("id", productoId);

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath("/productos");
  return { ok: true };
}
