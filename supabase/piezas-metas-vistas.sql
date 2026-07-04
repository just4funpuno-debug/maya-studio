-- Maya Studio — Fase 1: metas de vistas por pieza y red
-- Requiere: rls-03 (piezas con SELECT/INSERT)

BEGIN;

ALTER TABLE public.piezas
  ADD COLUMN IF NOT EXISTS meta_vistas_tiktok     integer,
  ADD COLUMN IF NOT EXISTS meta_vistas_instagram  integer,
  ADD COLUMN IF NOT EXISTS meta_vistas_facebook   integer;

COMMENT ON COLUMN public.piezas.meta_vistas_tiktok IS
  'Meta máxima de vistas alcanzada en TikTok (NULL = sin marcar). +100k = 100001.';
COMMENT ON COLUMN public.piezas.meta_vistas_instagram IS
  'Meta máxima de vistas alcanzada en Instagram (NULL = sin marcar). +100k = 100001.';
COMMENT ON COLUMN public.piezas.meta_vistas_facebook IS
  'Meta máxima de vistas alcanzada en Facebook (NULL = sin marcar). +100k = 100001.';

ALTER TABLE public.piezas
  ADD CONSTRAINT piezas_meta_vistas_tiktok_check
    CHECK (
      meta_vistas_tiktok IS NULL
      OR meta_vistas_tiktok IN (
        250, 500, 1000, 3000, 5000, 10000,
        30000, 50000, 80000, 100000, 100001
      )
    ),
  ADD CONSTRAINT piezas_meta_vistas_instagram_check
    CHECK (
      meta_vistas_instagram IS NULL
      OR meta_vistas_instagram IN (
        250, 500, 1000, 3000, 5000, 10000,
        30000, 50000, 80000, 100000, 100001
      )
    ),
  ADD CONSTRAINT piezas_meta_vistas_facebook_check
    CHECK (
      meta_vistas_facebook IS NULL
      OR meta_vistas_facebook IN (
        250, 500, 1000, 3000, 5000, 10000,
        30000, 50000, 80000, 100000, 100001
      )
    );

DROP POLICY IF EXISTS piezas_update_asignados ON public.piezas;
CREATE POLICY piezas_update_asignados
  ON public.piezas FOR UPDATE TO authenticated
  USING (public.tiene_producto(producto_id))
  WITH CHECK (public.tiene_producto(producto_id));

COMMIT;
