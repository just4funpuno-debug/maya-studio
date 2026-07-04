"use server";

import { requiereAdmin } from "@/lib/auth/requiere-admin";
import {
  contarProductosConPrompt,
  promptMaestroExiste,
  validarIdPrompt,
} from "@/lib/prompts/prompts-maestros";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type AccionPromptResult =
  | { ok: true }
  | { ok: false; error: string };

function revalidarPrompts(id?: string) {
  revalidatePath("/prompts");
  if (id) revalidatePath(`/prompts/${id}/editar`);
  revalidatePath("/productos");
  revalidatePath("/productos/[id]/prompt", "page");
}

export async function crearPromptAction(
  formData: FormData
): Promise<AccionPromptResult> {
  const auth = await requiereAdmin();
  if (!auth.ok) return { ok: false, error: auth.error };

  const id = String(formData.get("id") ?? "").trim();
  const nombre = String(formData.get("nombre") ?? "").trim();
  const descripcion = String(formData.get("descripcion") ?? "").trim();
  const contenido = String(formData.get("contenido") ?? "").trim();

  const errorId = validarIdPrompt(id);
  if (errorId) return { ok: false, error: errorId };

  if (!nombre) {
    return { ok: false, error: "El nombre es obligatorio." };
  }

  if (!contenido) {
    return { ok: false, error: "El contenido del prompt es obligatorio." };
  }

  const supabase = await createClient();

  if (await promptMaestroExiste(supabase, id)) {
    return {
      ok: false,
      error: `Ya existe un prompt con el identificador "${id}".`,
    };
  }

  const { error } = await supabase.from("prompts_maestros").insert({
    id,
    nombre,
    descripcion: descripcion || null,
    contenido,
    es_editable: true,
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidarPrompts(id);
  return { ok: true };
}

export async function actualizarPromptAction(
  promptId: string,
  formData: FormData
): Promise<AccionPromptResult> {
  const auth = await requiereAdmin();
  if (!auth.ok) return { ok: false, error: auth.error };

  const nombre = String(formData.get("nombre") ?? "").trim();
  const descripcion = String(formData.get("descripcion") ?? "").trim();
  const contenido = String(formData.get("contenido") ?? "").trim();

  if (!nombre) {
    return { ok: false, error: "El nombre es obligatorio." };
  }

  if (!contenido) {
    return { ok: false, error: "El contenido del prompt es obligatorio." };
  }

  const supabase = await createClient();

  const { data: existente, error: errorLectura } = await supabase
    .from("prompts_maestros")
    .select("es_editable")
    .eq("id", promptId)
    .maybeSingle();

  if (errorLectura) {
    return { ok: false, error: errorLectura.message };
  }

  if (!existente) {
    return { ok: false, error: "No se encontró el prompt." };
  }

  if (!existente.es_editable) {
    return {
      ok: false,
      error: "Este prompt del sistema no se puede editar desde el panel.",
    };
  }

  const { error } = await supabase
    .from("prompts_maestros")
    .update({
      nombre,
      descripcion: descripcion || null,
      contenido,
    })
    .eq("id", promptId);

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidarPrompts(promptId);
  return { ok: true };
}

export async function eliminarPromptAction(
  promptId: string
): Promise<AccionPromptResult> {
  const auth = await requiereAdmin();
  if (!auth.ok) return { ok: false, error: auth.error };

  const supabase = await createClient();

  const { data: existente, error: errorLectura } = await supabase
    .from("prompts_maestros")
    .select("es_editable, nombre")
    .eq("id", promptId)
    .maybeSingle();

  if (errorLectura) {
    return { ok: false, error: errorLectura.message };
  }

  if (!existente) {
    return { ok: false, error: "No se encontró el prompt." };
  }

  if (!existente.es_editable) {
    return {
      ok: false,
      error: "Los prompts del sistema no se pueden eliminar.",
    };
  }

  const { count, error: errorConteo } = await contarProductosConPrompt(
    supabase,
    promptId
  );

  if (errorConteo) {
    return { ok: false, error: errorConteo };
  }

  if (count > 0) {
    return {
      ok: false,
      error: `${count} producto${count === 1 ? "" : "s"} usa${count === 1 ? "" : "n"} este prompt. Cámbiales la versión en Motor antes de borrarlo.`,
    };
  }

  const { error } = await supabase
    .from("prompts_maestros")
    .delete()
    .eq("id", promptId);

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidarPrompts(promptId);
  return { ok: true };
}
