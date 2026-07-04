-- Maya Studio — Foto de perfil del producto (solo panel, no motor)
ALTER TABLE public.productos
  ADD COLUMN IF NOT EXISTS foto_perfil_url text;

COMMENT ON COLUMN public.productos.foto_perfil_url IS
  'URL pública de la foto decorativa del producto en el panel. No la usa el motor de generación.';
