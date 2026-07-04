import type { SupabaseClient } from "@supabase/supabase-js";
import { etiquetaVersion } from "@/prompts/versiones";

export type PromptMaestroListado = {
  id: string;
  nombre: string;
  descripcion: string | null;
  es_editable: boolean;
  actualizado_en?: string;
};

export type PromptMaestroCompleto = PromptMaestroListado & {
  contenido: string;
};

const PATRON_ID_PROMPT = /^[a-z0-9][a-z0-9._-]{1,48}$/i;

export function validarIdPrompt(id: string): string | null {
  const trimmed = id.trim();
  if (!trimmed) return "El identificador es obligatorio.";
  if (!PATRON_ID_PROMPT.test(trimmed)) {
    return "Usa solo letras, números, puntos, guiones o guiones bajos (2–49 caracteres).";
  }
  return null;
}

export async function cargarListaPromptsMaestros(
  supabase: SupabaseClient
): Promise<{ prompts: PromptMaestroListado[]; error: string | null }> {
  const { data, error } = await supabase
    .from("prompts_maestros")
    .select("id, nombre, descripcion, es_editable, actualizado_en")
    .order("creado_en", { ascending: true });

  if (error) return { prompts: [], error: error.message };
  return { prompts: data ?? [], error: null };
}

export async function cargarPromptMaestroPorId(
  supabase: SupabaseClient,
  id: string
): Promise<{ prompt: PromptMaestroCompleto | null; error: string | null }> {
  const { data, error } = await supabase
    .from("prompts_maestros")
    .select("id, nombre, descripcion, contenido, es_editable, actualizado_en")
    .eq("id", id)
    .maybeSingle();

  if (error) return { prompt: null, error: error.message };
  return { prompt: data, error: null };
}

export async function promptMaestroExiste(
  supabase: SupabaseClient,
  id: string
): Promise<boolean> {
  const { count, error } = await supabase
    .from("prompts_maestros")
    .select("id", { count: "exact", head: true })
    .eq("id", id);

  return !error && (count ?? 0) > 0;
}

export async function contarProductosConPrompt(
  supabase: SupabaseClient,
  promptId: string
): Promise<{ count: number; error: string | null }> {
  const { count, error } = await supabase
    .from("productos")
    .select("id", { count: "exact", head: true })
    .eq("version_prompt", promptId);

  if (error) return { count: 0, error: error.message };
  return { count: count ?? 0, error: null };
}

export function mapaEtiquetasPrompts(
  prompts: PromptMaestroListado[]
): Map<string, string> {
  return new Map(prompts.map((p) => [p.id, p.nombre]));
}

export function resolverEtiquetaPrompt(
  id: string,
  mapa: Map<string, string>
): string {
  return mapa.get(id) ?? etiquetaVersion(id);
}

/** Mantiene visible la versión del producto aunque no esté en la biblioteca. */
export function asegurarPromptEnLista(
  prompts: PromptMaestroListado[],
  versionActual: string
): PromptMaestroListado[] {
  if (prompts.some((p) => p.id === versionActual)) return prompts;
  const mapa = mapaEtiquetasPrompts(prompts);
  return [
    ...prompts,
    {
      id: versionActual,
      nombre: resolverEtiquetaPrompt(versionActual, mapa),
      descripcion:
        "Versión asignada al producto (no aparece en la biblioteca actual).",
      es_editable: false,
    },
  ];
}
