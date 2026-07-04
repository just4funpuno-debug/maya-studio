-- ============================================================
-- Maya Studio — Versión del prompt maestro por producto
-- Ejecutar en Supabase → SQL Editor (o vía MCP)
-- ============================================================

ALTER TABLE productos
  ADD COLUMN version_prompt text NOT NULL DEFAULT 'v1.1';
