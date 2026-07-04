"use server";

import { requiereAdmin } from "@/lib/auth/requiere-admin";
import { createClient } from "@/lib/supabase/server";
import {
  CategoriaFoto,
  IMAGEN_TIPOS_PERMITIDOS,
  MAX_IMAGEN_BYTES,
  PRODUCTOS_BUCKET,
  rutaDesdeUrlPublica,
} from "@/lib/storage/productos";
import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";

export type AccionFotoResult = { ok: true } | { ok: false; error: string };

export type FotoInsertada = {
  id: string;
  imagen_url: string;
  creado_en: string;
  es_principal: boolean;
};

export type AgregarFotoResult =
  | { ok: true; foto: FotoInsertada }
  | { ok: false; error: string };

export type EliminarFotoResult =
  | { ok: true; nuevaPrincipalId: string | null }
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

function revalidarFotos(productoId: string, categoria?: CategoriaFoto) {
  revalidatePath(`/productos/${productoId}/fotos`);
  if (categoria === "caja") {
    revalidatePath("/productos");
  }
}

function revalidarFotoPerfil(productoId: string) {
  revalidatePath(`/productos/${productoId}/fotos`);
  revalidatePath("/productos");
  revalidatePath("/generar");
  revalidatePath("/calendario");
  revalidatePath("/");
}

export async function subirFotoPerfilAction(
  productoId: string,
  formData: FormData
): Promise<AccionFotoResult> {
  const auth = await requiereAdmin();
  if (!auth.ok) return { ok: false, error: auth.error };

  const imagen = formData.get("imagen");

  if (!(imagen instanceof File) || imagen.size === 0) {
    return { ok: false, error: "Debes seleccionar una imagen." };
  }

  if (
    !IMAGEN_TIPOS_PERMITIDOS.includes(
      imagen.type as (typeof IMAGEN_TIPOS_PERMITIDOS)[number]
    )
  ) {
    return { ok: false, error: "Formato no válido. Usa JPG, PNG, WebP o GIF." };
  }

  if (imagen.size > MAX_IMAGEN_BYTES) {
    return { ok: false, error: "La imagen no puede superar 5 MB." };
  }

  const supabase = await createClient();

  const { data: producto, error: fetchError } = await supabase
    .from("productos")
    .select("foto_perfil_url")
    .eq("id", productoId)
    .single();

  if (fetchError || !producto) {
    return { ok: false, error: "No se encontró el producto." };
  }

  const ext = extensionDesdeMime(imagen.type);
  const storagePath = `${productoId}/perfil/${randomUUID()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from(PRODUCTOS_BUCKET)
    .upload(storagePath, imagen, {
      contentType: imagen.type,
      upsert: false,
    });

  if (uploadError) {
    return { ok: false, error: `Error al subir la imagen: ${uploadError.message}` };
  }

  const { data: urlData } = supabase.storage
    .from(PRODUCTOS_BUCKET)
    .getPublicUrl(storagePath);

  const { error: updateError } = await supabase
    .from("productos")
    .update({ foto_perfil_url: urlData.publicUrl })
    .eq("id", productoId);

  if (updateError) {
    await supabase.storage.from(PRODUCTOS_BUCKET).remove([storagePath]);
    return { ok: false, error: updateError.message };
  }

  if (producto.foto_perfil_url) {
    const rutaAnterior = rutaDesdeUrlPublica(producto.foto_perfil_url);
    if (rutaAnterior) {
      await supabase.storage.from(PRODUCTOS_BUCKET).remove([rutaAnterior]);
    }
  }

  revalidarFotoPerfil(productoId);
  return { ok: true };
}

export async function eliminarFotoPerfilAction(
  productoId: string
): Promise<AccionFotoResult> {
  const auth = await requiereAdmin();
  if (!auth.ok) return { ok: false, error: auth.error };

  const supabase = await createClient();

  const { data: producto, error: fetchError } = await supabase
    .from("productos")
    .select("foto_perfil_url")
    .eq("id", productoId)
    .single();

  if (fetchError || !producto) {
    return { ok: false, error: "No se encontró el producto." };
  }

  if (!producto.foto_perfil_url) {
    return { ok: true };
  }

  const storagePath = rutaDesdeUrlPublica(producto.foto_perfil_url);
  if (storagePath) {
    await supabase.storage.from(PRODUCTOS_BUCKET).remove([storagePath]);
  }

  const { error: updateError } = await supabase
    .from("productos")
    .update({ foto_perfil_url: null })
    .eq("id", productoId);

  if (updateError) {
    return { ok: false, error: updateError.message };
  }

  revalidarFotoPerfil(productoId);
  return { ok: true };
}

/** Activa o desactiva una categoría. Al desactivar, las fotos permanecen en BD y Storage. */
export async function actualizarCategoriaFotoActiva(
  productoId: string,
  categoria: CategoriaFoto,
  activo: boolean
): Promise<AccionFotoResult> {
  const auth = await requiereAdmin();
  if (!auth.ok) return { ok: false, error: auth.error };

  const supabase = await createClient();
  const { error } = await supabase.from("producto_config_fotos").upsert(
    {
      producto_id: productoId,
      categoria,
      activo,
    },
    { onConflict: "producto_id,categoria" }
  );

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidarFotos(productoId);
  return { ok: true };
}

export async function agregarFoto(
  productoId: string,
  categoria: CategoriaFoto,
  formData: FormData
): Promise<AgregarFotoResult> {
  const auth = await requiereAdmin();
  if (!auth.ok) return { ok: false, error: auth.error };

  const imagen = formData.get("imagen");

  if (!(imagen instanceof File) || imagen.size === 0) {
    return { ok: false, error: "Debes seleccionar una imagen." };
  }

  if (
    !IMAGEN_TIPOS_PERMITIDOS.includes(
      imagen.type as (typeof IMAGEN_TIPOS_PERMITIDOS)[number]
    )
  ) {
    return { ok: false, error: "Formato no válido. Usa JPG, PNG, WebP o GIF." };
  }

  if (imagen.size > MAX_IMAGEN_BYTES) {
    return { ok: false, error: "La imagen no puede superar 5 MB." };
  }

  const supabase = await createClient();

  const { data: config } = await supabase
    .from("producto_config_fotos")
    .select("activo")
    .eq("producto_id", productoId)
    .eq("categoria", categoria)
    .maybeSingle();

  if (!config?.activo) {
    return {
      ok: false,
      error: "Esta categoría está desactivada. Actívala antes de subir fotos.",
    };
  }

  const { count, error: countError } = await supabase
    .from("fotos_producto")
    .select("id", { count: "exact", head: true })
    .eq("producto_id", productoId)
    .eq("categoria", categoria);

  if (countError) {
    return { ok: false, error: countError.message };
  }

  const esPrimeraDeCategoria = (count ?? 0) === 0;

  const ext = extensionDesdeMime(imagen.type);
  const storagePath = `${productoId}/${categoria}/${randomUUID()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from(PRODUCTOS_BUCKET)
    .upload(storagePath, imagen, {
      contentType: imagen.type,
      upsert: false,
    });

  if (uploadError) {
    return { ok: false, error: `Error al subir la imagen: ${uploadError.message}` };
  }

  const { data: urlData } = supabase.storage
    .from(PRODUCTOS_BUCKET)
    .getPublicUrl(storagePath);

  const { data: nuevaFoto, error: insertError } = await supabase
    .from("fotos_producto")
    .insert({
      producto_id: productoId,
      categoria,
      imagen_url: urlData.publicUrl,
      es_principal: esPrimeraDeCategoria,
    })
    .select("id, imagen_url, creado_en, es_principal")
    .single();

  if (insertError || !nuevaFoto) {
    await supabase.storage.from(PRODUCTOS_BUCKET).remove([storagePath]);
    return { ok: false, error: insertError?.message ?? "No se pudo guardar la foto." };
  }

  revalidarFotos(productoId, categoria);
  return { ok: true, foto: nuevaFoto };
}

export async function marcarComoPrincipal(
  fotoId: string,
  productoId: string
): Promise<AccionFotoResult> {
  const auth = await requiereAdmin();
  if (!auth.ok) return { ok: false, error: auth.error };

  const supabase = await createClient();

  const { data: foto, error: fetchError } = await supabase
    .from("fotos_producto")
    .select("categoria, es_principal")
    .eq("id", fotoId)
    .eq("producto_id", productoId)
    .single();

  if (fetchError || !foto) {
    return { ok: false, error: "No se encontró la foto." };
  }

  if (foto.es_principal) {
    return { ok: true };
  }

  const { error: resetError } = await supabase
    .from("fotos_producto")
    .update({ es_principal: false })
    .eq("producto_id", productoId)
    .eq("categoria", foto.categoria);

  if (resetError) {
    return { ok: false, error: resetError.message };
  }

  const { error: setError } = await supabase
    .from("fotos_producto")
    .update({ es_principal: true })
    .eq("id", fotoId)
    .eq("producto_id", productoId);

  if (setError) {
    return { ok: false, error: setError.message };
  }

  revalidarFotos(productoId, foto.categoria);
  return { ok: true };
}

export async function eliminarFoto(
  fotoId: string,
  productoId: string
): Promise<EliminarFotoResult> {
  const auth = await requiereAdmin();
  if (!auth.ok) return { ok: false, error: auth.error };

  const supabase = await createClient();

  const { data: foto, error: fetchError } = await supabase
    .from("fotos_producto")
    .select("imagen_url, categoria, es_principal")
    .eq("id", fotoId)
    .eq("producto_id", productoId)
    .single();

  if (fetchError || !foto) {
    return { ok: false, error: "No se encontró la foto." };
  }

  if (foto.imagen_url) {
    const storagePath = rutaDesdeUrlPublica(foto.imagen_url);
    if (storagePath) {
      await supabase.storage.from(PRODUCTOS_BUCKET).remove([storagePath]);
    }
  }

  const { error: deleteError } = await supabase
    .from("fotos_producto")
    .delete()
    .eq("id", fotoId)
    .eq("producto_id", productoId);

  if (deleteError) {
    return { ok: false, error: deleteError.message };
  }

  let nuevaPrincipalId: string | null = null;

  if (foto.es_principal) {
    const { data: siguiente } = await supabase
      .from("fotos_producto")
      .select("id")
      .eq("producto_id", productoId)
      .eq("categoria", foto.categoria)
      .order("creado_en", { ascending: true })
      .order("id", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (siguiente) {
      const { error: promoteError } = await supabase
        .from("fotos_producto")
        .update({ es_principal: true })
        .eq("id", siguiente.id);

      if (promoteError) {
        return { ok: false, error: promoteError.message };
      }

      nuevaPrincipalId = siguiente.id;
    }
  }

  revalidarFotos(productoId, foto.categoria);
  return { ok: true, nuevaPrincipalId };
}
