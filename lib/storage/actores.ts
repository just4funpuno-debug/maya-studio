export const ACTORES_BUCKET = "actores";

export const MAX_IMAGEN_BYTES = 5 * 1024 * 1024; // 5 MB

export const IMAGEN_TIPOS_PERMITIDOS = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
] as const;

/** Extrae la ruta interna del bucket desde una URL pública de Supabase Storage. */
export function rutaDesdeUrlPublica(imagenUrl: string): string | null {
  const marker = `/object/public/${ACTORES_BUCKET}/`;
  const idx = imagenUrl.indexOf(marker);
  if (idx === -1) return null;
  return decodeURIComponent(imagenUrl.slice(idx + marker.length));
}
