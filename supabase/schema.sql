-- ============================================================
-- Maya Studio — Esquema inicial de base de datos
-- Ejecutar completo en: Supabase → SQL Editor → New query → Run
-- Sin RLS por ahora (se configurará con autenticación)
-- ============================================================

-- ------------------------------------------------------------
-- 1. productos
-- ------------------------------------------------------------
CREATE TABLE productos (
  id                uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre            text        NOT NULL,
  documento_maestro text,
  ciclo_actual      integer     NOT NULL DEFAULT 1,
  dia_actual        integer     NOT NULL DEFAULT 1,
  version_prompt    text        NOT NULL DEFAULT 'v1.1',
  modelo_ia         text        NOT NULL DEFAULT 'claude-haiku-4-5',
  creado_en         timestamptz NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------
-- 2. tipos_contenido (catálogo maestro)
-- ------------------------------------------------------------
CREATE TABLE tipos_contenido (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre      text NOT NULL,
  descripcion text,
  tipo_salida text CHECK (tipo_salida IN ('prompts', 'guion', 'carrusel'))
);

-- ------------------------------------------------------------
-- 3. producto_tipos (toggles por producto)
-- ------------------------------------------------------------
CREATE TABLE producto_tipos (
  id          uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  producto_id uuid    NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
  tipo_id     uuid    NOT NULL REFERENCES tipos_contenido(id) ON DELETE CASCADE,
  activo      boolean NOT NULL DEFAULT true,
  UNIQUE (producto_id, tipo_id)
);

-- ------------------------------------------------------------
-- 4. actores (banco de actores por producto)
-- ------------------------------------------------------------
CREATE TABLE actores (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  producto_id uuid        NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
  nombre      text,
  imagen_url  text,
  perfil      text,
  creado_en   timestamptz NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------
-- 5. piezas (historial de contenido aprobado)
-- ------------------------------------------------------------
CREATE TABLE piezas (
  id                 uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  producto_id        uuid        NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
  dia                integer,
  ciclo              integer,
  formato            text,
  tipo_contenido     text,
  hook               text,
  angulo             text,
  keyword            text,
  contenido_completo jsonb,
  estado             text        NOT NULL DEFAULT 'aprobado',
  creado_en          timestamptz NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------
-- 6. usuarios (roles del panel)
-- ------------------------------------------------------------
CREATE TABLE usuarios (
  id        uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  email     text,
  rol       text CHECK (rol IN ('admin', 'creador')),
  creado_en timestamptz NOT NULL DEFAULT now()
);

-- Índices en claves foráneas (mejoran consultas por producto)
CREATE INDEX idx_producto_tipos_producto_id ON producto_tipos (producto_id);
CREATE INDEX idx_producto_tipos_tipo_id     ON producto_tipos (tipo_id);
CREATE INDEX idx_actores_producto_id        ON actores (producto_id);
CREATE INDEX idx_piezas_producto_id         ON piezas (producto_id);
