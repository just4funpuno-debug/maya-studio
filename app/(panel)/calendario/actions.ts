"use server";

import {
  columnaPorRed,
  metaAnterior,
  metaVistasValida,
  type RedSocialMeta,
} from "@/lib/metricas/metas-vistas";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type ActualizarMetaVistasResult =
  | { ok: true }
  | { ok: false; error: string };

const REDES_VALIDAS: RedSocialMeta[] = ["tiktok", "instagram", "facebook"];

export async function actualizarMetaVistas(
  piezaId: string,
  red: RedSocialMeta,
  valorMeta: number | null
): Promise<ActualizarMetaVistasResult> {
  if (!REDES_VALIDAS.includes(red)) {
    return { ok: false, error: "Red social no válida." };
  }

  if (!metaVistasValida(valorMeta)) {
    return { ok: false, error: "Meta de vistas no válida." };
  }

  const supabase = await createClient();

  const { data: pieza, error: errorLectura } = await supabase
    .from("piezas")
    .select("id, producto_id, meta_vistas_tiktok, meta_vistas_instagram, meta_vistas_facebook")
    .eq("id", piezaId)
    .eq("estado", "aprobado")
    .maybeSingle();

  if (errorLectura) {
    return { ok: false, error: errorLectura.message };
  }

  if (!pieza) {
    return { ok: false, error: "No se encontró la pieza." };
  }

  const columna = columnaPorRed(red);
  const valorActual = pieza[columna] as number | null;

  let nuevoValor = valorMeta;
  if (valorMeta != null && valorActual === valorMeta) {
    nuevoValor = metaAnterior(valorActual);
  }

  const { error } = await supabase
    .from("piezas")
    .update({ [columna]: nuevoValor })
    .eq("id", piezaId);

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath("/");
  revalidatePath("/calendario");
  revalidatePath(`/calendario/${piezaId}`);
  return { ok: true };
}
