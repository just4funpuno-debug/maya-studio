-- ============================================================
-- Maya Studio — Fotos del producto (archivos subidos)
-- Ejecutar en Supabase → SQL Editor (o vía MCP)
-- ============================================================

CREATE TABLE fotos_producto (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  producto_id uuid        NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
  categoria   text        NOT NULL CHECK (categoria IN ('caja', 'frasco', 'capsulas')),
  imagen_url  text        NOT NULL,
  es_principal boolean    NOT NULL DEFAULT false,
  creado_en   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_fotos_producto_producto_id ON fotos_producto (producto_id);

-- Solo una foto principal por producto + categoría
CREATE UNIQUE INDEX idx_fotos_producto_una_principal
  ON fotos_producto (producto_id, categoria)
  WHERE es_principal = true;

-- ============================================================
-- Qué categorías de fotos aplican a cada producto (toggles)
-- ============================================================

CREATE TABLE producto_config_fotos (
  id          uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  producto_id uuid    NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
  categoria   text    NOT NULL CHECK (categoria IN ('caja', 'frasco', 'capsulas')),
  activo      boolean NOT NULL DEFAULT false,
  UNIQUE (producto_id, categoria)
);
