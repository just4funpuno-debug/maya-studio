-- ============================================================
-- Maya Studio — Modelo de IA por producto
-- Ejecutar en Supabase → SQL Editor (o vía MCP)
-- ============================================================

ALTER TABLE public.productos
  ADD COLUMN IF NOT EXISTS modelo_ia text NOT NULL DEFAULT 'claude-haiku-4-5';

COMMENT ON COLUMN public.productos.modelo_ia IS
  'ID del modelo Anthropic usado al generar piezas (ej. claude-haiku-4-5).';
