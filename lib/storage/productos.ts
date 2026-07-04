export const PRODUCTOS_BUCKET = "productos";

export { MAX_IMAGEN_BYTES, IMAGEN_TIPOS_PERMITIDOS } from "@/lib/storage/actores";

/** Extrae la ruta interna del bucket desde una URL pública de Supabase Storage. */
export function rutaDesdeUrlPublica(imagenUrl: string): string | null {
  const marker = `/object/public/${PRODUCTOS_BUCKET}/`;
  const idx = imagenUrl.indexOf(marker);
  if (idx === -1) return null;
  return decodeURIComponent(imagenUrl.slice(idx + marker.length));
}

export const CATEGORIAS_FOTO = ["caja", "frasco", "capsulas"] as const;

export type CategoriaFoto = (typeof CATEGORIAS_FOTO)[number];

export const ETIQUETAS_CATEGORIA: Record<CategoriaFoto, string> = {
  caja: "Caja",
  frasco: "Frasco",
  capsulas: "Cápsulas",
};
