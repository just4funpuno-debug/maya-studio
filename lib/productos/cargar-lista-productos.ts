import { getBoliviaDayBoundsUtc } from "@/lib/date/bolivia";
import type { UsuarioPerfil } from "@/lib/auth/perfil";
import { esAdmin } from "@/lib/auth/requiere-admin";
import { productosAsignadosIds } from "@/lib/auth/permisos";
import { createClient } from "@/lib/supabase/server";

export type PublicoProducto = "unisex" | "hombres" | "mujeres";

export type ProductoListado = {
  id: string;
  nombre: string;
  ciclo_actual: number;
  dia_actual: number;
  version_prompt: string;
  publico: PublicoProducto;
  imagenCajaUrl: string | null;
  generadoHoy: boolean;
};

export async function cargarListaProductos(
  usuario: UsuarioPerfil | null
): Promise<{
  productos: ProductoListado[];
  error: string | null;
}> {
  const supabase = await createClient();
  const { startIso, endIso } = getBoliviaDayBoundsUtc();

  let productoIdsPermitidos: string[] | null = null;
  if (usuario && !esAdmin(usuario)) {
    productoIdsPermitidos = await productosAsignadosIds(usuario.id);
    if (productoIdsPermitidos.length === 0) {
      return { productos: [], error: null };
    }
  }

  let queryProductos = supabase
    .from("productos")
    .select("id, nombre, ciclo_actual, dia_actual, version_prompt, publico, foto_perfil_url")
    .order("creado_en", { ascending: false });

  if (productoIdsPermitidos) {
    queryProductos = queryProductos.in("id", productoIdsPermitidos);
  }

  const [productosRes, fotosRes, piezasRes] = await Promise.all([
    queryProductos,
    supabase
      .from("fotos_producto")
      .select("producto_id, imagen_url")
      .eq("categoria", "caja")
      .eq("es_principal", true),
    supabase
      .from("piezas")
      .select("producto_id")
      .eq("estado", "aprobado")
      .gte("creado_en", startIso)
      .lt("creado_en", endIso),
  ]);

  if (productosRes.error) {
    return { productos: [], error: productosRes.error.message };
  }

  const fotosPorProducto = new Map<string, string>();
  for (const foto of fotosRes.data ?? []) {
    if (
      !productoIdsPermitidos ||
      productoIdsPermitidos.includes(foto.producto_id)
    ) {
      fotosPorProducto.set(foto.producto_id, foto.imagen_url);
    }
  }

  const productosConPiezaHoy = new Set<string>();
  for (const pieza of piezasRes.data ?? []) {
    if (
      !productoIdsPermitidos ||
      productoIdsPermitidos.includes(pieza.producto_id)
    ) {
      productosConPiezaHoy.add(pieza.producto_id);
    }
  }

  const productos: ProductoListado[] = (productosRes.data ?? []).map(
    (producto) => ({
      id: producto.id,
      nombre: producto.nombre,
      ciclo_actual: producto.ciclo_actual,
      dia_actual: producto.dia_actual,
      version_prompt: producto.version_prompt,
      publico: (producto.publico as PublicoProducto) ?? "unisex",
      imagenCajaUrl:
        producto.foto_perfil_url ??
        fotosPorProducto.get(producto.id) ??
        null,
      generadoHoy: productosConPiezaHoy.has(producto.id),
    })
  );

  return { productos, error: null };
}
