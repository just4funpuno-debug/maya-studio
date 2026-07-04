import type { UsuarioPerfil } from "@/lib/auth/perfil";
import { createClient } from "@/lib/supabase/server";

export type PiezaHistorialResumen = {
  id: string;
  hook: string | null;
  tipo_contenido: string | null;
  dia: number | null;
  ciclo: number | null;
  creado_en: string;
  productoId: string;
  productoNombre: string;
  imagenCajaUrl: string | null;
  meta_vistas_tiktok: number | null;
  meta_vistas_instagram: number | null;
  meta_vistas_facebook: number | null;
};

type ProductoJoin = { nombre: string } | { nombre: string }[] | null;

function nombreProducto(join: ProductoJoin): string {
  if (!join) return "Producto";
  if (Array.isArray(join)) return join[0]?.nombre ?? "Producto";
  return join.nombre;
}

export async function cargarHistorialPiezas(
  productoIdFiltro?: string | null,
  limite?: number,
  desdeIso?: string
): Promise<{
  piezas: PiezaHistorialResumen[];
  error: string | null;
}> {
  const supabase = await createClient();

  let query = supabase
    .from("piezas")
    .select(
      `
      id,
      producto_id,
      dia,
      ciclo,
      tipo_contenido,
      hook,
      creado_en,
      meta_vistas_tiktok,
      meta_vistas_instagram,
      meta_vistas_facebook,
      productos ( nombre )
    `
    )
    .eq("estado", "aprobado")
    .order("creado_en", { ascending: false });

  if (productoIdFiltro) {
    query = query.eq("producto_id", productoIdFiltro);
  }

  if (desdeIso) {
    query = query.gte("creado_en", desdeIso);
  }

  if (limite != null && limite > 0) {
    query = query.limit(limite);
  }

  const { data: filas, error } = await query;

  if (error) {
    return { piezas: [], error: error.message };
  }

  const productoIds = [
    ...new Set((filas ?? []).map((f) => f.producto_id as string)),
  ];

  const fotosPorProducto = new Map<string, string>();
  const perfilPorProducto = new Map<string, string>();

  if (productoIds.length > 0) {
    const [{ data: fotos }, { data: productos }] = await Promise.all([
      supabase
        .from("fotos_producto")
        .select("producto_id, imagen_url")
        .in("producto_id", productoIds)
        .eq("categoria", "caja")
        .eq("es_principal", true),
      supabase
        .from("productos")
        .select("id, foto_perfil_url")
        .in("id", productoIds),
    ]);

    for (const foto of fotos ?? []) {
      fotosPorProducto.set(foto.producto_id, foto.imagen_url);
    }

    for (const producto of productos ?? []) {
      if (producto.foto_perfil_url) {
        perfilPorProducto.set(producto.id, producto.foto_perfil_url);
      }
    }
  }

  const piezas: PiezaHistorialResumen[] = (filas ?? []).map((fila) => ({
    id: fila.id,
    hook: fila.hook,
    tipo_contenido: fila.tipo_contenido,
    dia: fila.dia,
    ciclo: fila.ciclo,
    creado_en: fila.creado_en,
    productoId: fila.producto_id,
    productoNombre: nombreProducto(fila.productos as ProductoJoin),
    imagenCajaUrl:
      perfilPorProducto.get(fila.producto_id) ??
      fotosPorProducto.get(fila.producto_id) ??
      null,
    meta_vistas_tiktok: fila.meta_vistas_tiktok ?? null,
    meta_vistas_instagram: fila.meta_vistas_instagram ?? null,
    meta_vistas_facebook: fila.meta_vistas_facebook ?? null,
  }));

  return { piezas, error: null };
}

/** Productos disponibles para el filtro (respeta RLS vía cargarListaProductos). */
export async function cargarProductosParaFiltro(
  usuario: UsuarioPerfil | null
): Promise<{ id: string; nombre: string }[]> {
  const { cargarListaProductos } = await import(
    "@/lib/productos/cargar-lista-productos"
  );
  const { productos } = await cargarListaProductos(usuario);
  return productos.map((p) => ({ id: p.id, nombre: p.nombre }));
}
