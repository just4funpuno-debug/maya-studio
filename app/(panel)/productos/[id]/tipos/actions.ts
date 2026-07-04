"use server";

import { requiereAdmin } from "@/lib/auth/requiere-admin";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type ActualizarTipoActivoResult =
  | { ok: true }
  | { ok: false; error: string };

export async function actualizarTipoActivo(
  productoId: string,
  tipoId: string,
  activo: boolean
): Promise<ActualizarTipoActivoResult> {
  const auth = await requiereAdmin();
  if (!auth.ok) return { ok: false, error: auth.error };

  const supabase = await createClient();
  const { error } = await supabase.from("producto_tipos").upsert(
    {
      producto_id: productoId,
      tipo_id: tipoId,
      activo,
    },
    { onConflict: "producto_id,tipo_id" }
  );

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath(`/productos/${productoId}/tipos`);
  return { ok: true };
}
