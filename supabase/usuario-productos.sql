-- ============================================================
-- Maya Studio — Asignación de productos por usuario (creadores)
-- Ejecutar en Supabase → SQL Editor (o vía MCP)
-- ============================================================

CREATE TABLE usuario_productos (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id  uuid        NOT NULL REFERENCES usuarios (id) ON DELETE CASCADE,
  producto_id uuid        NOT NULL REFERENCES productos (id) ON DELETE CASCADE,
  creado_en   timestamptz NOT NULL DEFAULT now(),
  UNIQUE (usuario_id, producto_id)
);

CREATE INDEX idx_usuario_productos_usuario_id
  ON usuario_productos (usuario_id);

CREATE INDEX idx_usuario_productos_producto_id
  ON usuario_productos (producto_id);
