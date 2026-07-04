import type { SupabaseClient } from "@supabase/supabase-js";
import { ACTORES_BUCKET, rutaDesdeUrlPublica as rutaActorDesdeUrl } from "@/lib/storage/actores";
import {
  PRODUCTOS_BUCKET,
  rutaDesdeUrlPublica as rutaProductoDesdeUrl,
} from "@/lib/storage/productos";

const LOTE_BORRADO = 1000;

async function listarArchivosEnPrefijo(
  supabase: SupabaseClient,
  bucket: string,
  prefijo: string
): Promise<string[]> {
  const rutas: string[] = [];
  const { data, error } = await supabase.storage.from(bucket).list(prefijo, {
    limit: 1000,
  });

  if (error || !data) {
    return rutas;
  }

  for (const item of data) {
    const ruta = prefijo ? `${prefijo}/${item.name}` : item.name;
    if (item.id === null) {
      rutas.push(...(await listarArchivosEnPrefijo(supabase, bucket, ruta)));
    } else {
      rutas.push(ruta);
    }
  }

  return rutas;
}

function agregarRuta(destino: Set<string>, ruta: string | null) {
  if (ruta) destino.add(ruta);
}

async function recolectarRutasDesdeBd(
  supabase: SupabaseClient,
  productoId: string
): Promise<{ productos: Set<string>; actores: Set<string> }> {
  const rutasProductos = new Set<string>();
  const rutasActores = new Set<string>();

  const [
    { data: producto },
    { data: fotos },
    { data: actores },
  ] = await Promise.all([
    supabase
      .from("productos")
      .select("foto_perfil_url")
      .eq("id", productoId)
      .maybeSingle(),
    supabase
      .from("fotos_producto")
      .select("imagen_url")
      .eq("producto_id", productoId),
    supabase
      .from("actores")
      .select("imagen_url")
      .eq("producto_id", productoId),
  ]);

  if (producto?.foto_perfil_url) {
    agregarRuta(rutasProductos, rutaProductoDesdeUrl(producto.foto_perfil_url));
  }

  for (const foto of fotos ?? []) {
    agregarRuta(rutasProductos, rutaProductoDesdeUrl(foto.imagen_url));
  }

  for (const actor of actores ?? []) {
    if (actor.imagen_url) {
      agregarRuta(rutasActores, rutaActorDesdeUrl(actor.imagen_url));
    }
  }

  return { productos: rutasProductos, actores: rutasActores };
}

async function recolectarRutasDesdePrefijo(
  supabase: SupabaseClient,
  productoId: string
): Promise<{ productos: Set<string>; actores: Set<string> }> {
  const [archivosProductos, archivosActores] = await Promise.all([
    listarArchivosEnPrefijo(supabase, PRODUCTOS_BUCKET, productoId),
    listarArchivosEnPrefijo(supabase, ACTORES_BUCKET, productoId),
  ]);

  return {
    productos: new Set(archivosProductos),
    actores: new Set(archivosActores),
  };
}

async function borrarLote(
  supabase: SupabaseClient,
  bucket: string,
  rutas: string[]
): Promise<string | null> {
  for (let i = 0; i < rutas.length; i += LOTE_BORRADO) {
    const lote = rutas.slice(i, i + LOTE_BORRADO);
    const { error } = await supabase.storage.from(bucket).remove(lote);
    if (error) {
      return error.message;
    }
  }
  return null;
}

export async function borrarArchivosProducto(
  supabase: SupabaseClient,
  productoId: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const [desdeBd, desdePrefijo] = await Promise.all([
    recolectarRutasDesdeBd(supabase, productoId),
    recolectarRutasDesdePrefijo(supabase, productoId),
  ]);

  const rutasProductos = new Set([
    ...desdeBd.productos,
    ...desdePrefijo.productos,
  ]);
  const rutasActores = new Set([...desdeBd.actores, ...desdePrefijo.actores]);

  const errorProductos = await borrarLote(
    supabase,
    PRODUCTOS_BUCKET,
    [...rutasProductos]
  );
  if (errorProductos) {
    return {
      ok: false,
      error: `No se pudieron borrar las fotos del producto: ${errorProductos}`,
    };
  }

  const errorActores = await borrarLote(
    supabase,
    ACTORES_BUCKET,
    [...rutasActores]
  );
  if (errorActores) {
    return {
      ok: false,
      error: `No se pudieron borrar las fotos de actores: ${errorActores}`,
    };
  }

  return { ok: true };
}
