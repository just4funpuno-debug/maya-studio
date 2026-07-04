"use server";

import { requiereAdmin } from "@/lib/auth/requiere-admin";
import { generarActor } from "@/lib/motor/generar-actor";
import { createClient } from "@/lib/supabase/server";
import {
  ACTORES_BUCKET,
  IMAGEN_TIPOS_PERMITIDOS,
  MAX_IMAGEN_BYTES,
  rutaDesdeUrlPublica,
} from "@/lib/storage/actores";
import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";

export type AccionActorResult =
  | { ok: true }
  | { ok: false; error: string };

function extensionDesdeMime(mime: string): string {
  const map: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
  };
  return map[mime] ?? "jpg";
}

export async function eliminarActor(
  actorId: string,
  productoId: string
): Promise<AccionActorResult> {
  const auth = await requiereAdmin();
  if (!auth.ok) return { ok: false, error: auth.error };

  const supabase = await createClient();

  const { data: actor, error: fetchError } = await supabase
    .from("actores")
    .select("imagen_url")
    .eq("id", actorId)
    .eq("producto_id", productoId)
    .single();

  if (fetchError || !actor) {
    return { ok: false, error: "No se encontró el actor." };
  }

  if (actor.imagen_url) {
    const storagePath = rutaDesdeUrlPublica(actor.imagen_url);
    if (storagePath) {
      await supabase.storage.from(ACTORES_BUCKET).remove([storagePath]);
    }
  }

  const { error: deleteError } = await supabase
    .from("actores")
    .delete()
    .eq("id", actorId)
    .eq("producto_id", productoId);

  if (deleteError) {
    return { ok: false, error: deleteError.message };
  }

  revalidatePath(`/productos/${productoId}/actores`);
  return { ok: true };
}

export async function subirFotoActor(
  actorId: string,
  productoId: string,
  formData: FormData
): Promise<{ ok: true } | { ok: false; error: string }> {
  const auth = await requiereAdmin();
  if (!auth.ok) return { ok: false, error: auth.error };

  const supabase = await createClient();

  const imagen = formData.get("imagen");
  if (!(imagen instanceof File) || imagen.size === 0) {
    return { ok: false, error: "Selecciona una imagen." };
  }

  if (!IMAGEN_TIPOS_PERMITIDOS.includes(imagen.type as (typeof IMAGEN_TIPOS_PERMITIDOS)[number])) {
    return { ok: false, error: "Formato no permitido. Usa JPG, PNG, WebP o GIF." };
  }
  if (imagen.size > MAX_IMAGEN_BYTES) {
    return { ok: false, error: "La imagen supera los 5 MB." };
  }

  const { data: actorActual, error: actorError } = await supabase
    .from("actores")
    .select("id, imagen_url")
    .eq("id", actorId)
    .eq("producto_id", productoId)
    .single();

  if (actorError || !actorActual) {
    return { ok: false, error: "No se encontró el actor." };
  }

  const ext = extensionDesdeMime(imagen.type);
  const storagePath = `${productoId}/${randomUUID()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from(ACTORES_BUCKET)
    .upload(storagePath, imagen, { contentType: imagen.type });

  if (uploadError) {
    return { ok: false, error: `No se pudo subir la imagen: ${uploadError.message}` };
  }

  const { data: urlData } = supabase.storage
    .from(ACTORES_BUCKET)
    .getPublicUrl(storagePath);

  const { error: updateError } = await supabase
    .from("actores")
    .update({ imagen_url: urlData.publicUrl })
    .eq("id", actorId)
    .eq("producto_id", productoId);

  if (updateError) {
    await supabase.storage.from(ACTORES_BUCKET).remove([storagePath]);
    return { ok: false, error: `No se pudo guardar: ${updateError.message}` };
  }

  if (actorActual.imagen_url) {
    const rutaAnterior = rutaDesdeUrlPublica(actorActual.imagen_url);
    if (rutaAnterior) {
      await supabase.storage.from(ACTORES_BUCKET).remove([rutaAnterior]);
    }
  }

  revalidatePath(`/productos/${productoId}/actores`);
  return { ok: true };
}

export type GenerarActorActionResult =
  | {
      ok: true;
      nombre: string;
      identidad: Record<string, unknown>;
      descripcion_fisica: Record<string, unknown>;
      prompt_carrusel: string;
      notas: string | null;
    }
  | { ok: false; error: string; raw?: string; parseError?: string };

export async function generarActorAction(
  productoId: string
): Promise<GenerarActorActionResult> {
  const auth = await requiereAdmin();
  if (!auth.ok) return { ok: false, error: auth.error };

  const resultado = await generarActor(productoId);

  if (!resultado.ok) {
    return {
      ok: false,
      error: resultado.error,
      raw: resultado.raw,
      parseError: resultado.parseError,
    };
  }

  const { actor } = resultado;
  const nombreActor =
    typeof actor.identidad.nombre === "string"
      ? actor.identidad.nombre
      : "Actor generado";

  return {
    ok: true,
    nombre: nombreActor,
    identidad: actor.identidad,
    descripcion_fisica: actor.descripcion_fisica,
    prompt_carrusel: actor.prompt_carrusel,
    notas: actor.notas ?? null,
  };
}

export type GuardarActorConFotoResult =
  | { ok: true; actorId: string }
  | { ok: false; error: string };

export async function guardarActorConFoto(
  productoId: string,
  actorJson: string,
  formData: FormData
): Promise<GuardarActorConFotoResult> {
  const auth = await requiereAdmin();
  if (!auth.ok) return { ok: false, error: auth.error };

  const imagen = formData.get("imagen");
  if (!(imagen instanceof File) || imagen.size === 0) {
    return { ok: false, error: "Selecciona una imagen." };
  }
  if (!IMAGEN_TIPOS_PERMITIDOS.includes(imagen.type as (typeof IMAGEN_TIPOS_PERMITIDOS)[number])) {
    return { ok: false, error: "Formato no permitido. Usa JPG, PNG, WebP o GIF." };
  }
  if (imagen.size > MAX_IMAGEN_BYTES) {
    return { ok: false, error: "La imagen supera los 5 MB." };
  }

  let datosActor: {
    nombre: string;
    identidad: Record<string, unknown>;
    descripcion_fisica: Record<string, unknown>;
    prompt_carrusel: string;
    notas: string | null;
  };

  try {
    datosActor = JSON.parse(actorJson);
  } catch {
    return { ok: false, error: "Datos del actor inválidos." };
  }

  const supabase = await createClient();
  const ext = extensionDesdeMime(imagen.type);
  const storagePath = `${productoId}/${randomUUID()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from(ACTORES_BUCKET)
    .upload(storagePath, imagen, { contentType: imagen.type });

  if (uploadError) {
    return { ok: false, error: `No se pudo subir la imagen: ${uploadError.message}` };
  }

  const { data: urlData } = supabase.storage
    .from(ACTORES_BUCKET)
    .getPublicUrl(storagePath);

  const { data: inserted, error: insertError } = await supabase
    .from("actores")
    .insert({
      producto_id: productoId,
      nombre: datosActor.nombre,
      perfil: datosActor.notas,
      identidad: datosActor.identidad,
      descripcion_fisica: datosActor.descripcion_fisica,
      prompt_carrusel: datosActor.prompt_carrusel,
      notas: datosActor.notas,
      imagen_url: urlData.publicUrl,
    })
    .select("id")
    .single();

  if (insertError || !inserted) {
    await supabase.storage.from(ACTORES_BUCKET).remove([storagePath]);
    return { ok: false, error: `No se pudo guardar: ${insertError?.message ?? "error desconocido"}` };
  }

  revalidatePath(`/productos/${productoId}/actores`);
  return { ok: true, actorId: inserted.id };
}
