-- ============================================================
-- Maya Studio — Foto principal por categoría
-- Ejecutar en Supabase → SQL Editor (o vía MCP)
-- ============================================================

ALTER TABLE fotos_producto
  ADD COLUMN es_principal boolean NOT NULL DEFAULT false;

CREATE UNIQUE INDEX idx_fotos_producto_una_principal
  ON fotos_producto (producto_id, categoria)
  WHERE es_principal = true;

-- Fotos existentes: la más antigua de cada categoría pasa a principal
WITH ranked AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY producto_id, categoria
      ORDER BY creado_en ASC, id ASC
    ) AS rn
  FROM fotos_producto
)
UPDATE fotos_producto f
SET es_principal = true
FROM ranked r
WHERE f.id = r.id
  AND r.rn = 1;
