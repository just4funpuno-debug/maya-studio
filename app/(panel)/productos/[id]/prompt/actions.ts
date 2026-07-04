"use server";

import { requiereAdmin } from "@/lib/auth/requiere-admin";
import { promptMaestroExiste } from "@/lib/prompts/prompts-maestros";
import { createClient } from "@/lib/supabase/server";
import { modeloPorId } from "@/lib/motor/modelos";
import { revalidatePath } from "next/cache";

export type ActualizarVersionPromptResult =
  | { ok: true }
  | { ok: false; error: string };

export type ActualizarModeloIaResult =
  | { ok: true }
  | { ok: false; error: string };

export async function actualizarVersionPrompt(
  productoId: string,
  versionId: string
): Promise<ActualizarVersionPromptResult> {
  const auth = await requiereAdmin();
  if (!auth.ok) return { ok: false, error: auth.error };

  const supabase = await createClient();

  if (!(await promptMaestroExiste(supabase, versionId))) {
    return { ok: false, error: "Versión de prompt no válida." };
  }

  const { error } = await supabase
    .from("productos")
    .update({ version_prompt: versionId })
    .eq("id", productoId);

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath(`/productos/${productoId}/prompt`);
  revalidatePath("/productos");
  revalidatePath("/prompts");
  return { ok: true };
}

export async function actualizarModeloIa(
  productoId: string,
  modeloId: string
): Promise<ActualizarModeloIaResult> {
  const auth = await requiereAdmin();
  if (!auth.ok) return { ok: false, error: auth.error };

  if (!modeloPorId(modeloId)) {
    return { ok: false, error: "Modelo de IA no válido." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("productos")
    .update({ modelo_ia: modeloId })
    .eq("id", productoId);

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath(`/productos/${productoId}/prompt`);
  revalidatePath(`/productos/${productoId}/generar`);
  return { ok: true };
}
