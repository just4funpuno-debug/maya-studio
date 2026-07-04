-- Maya Studio — Biblioteca global de prompts maestros (Fase 1)
-- Requiere: rls-00 (es_admin)

BEGIN;

CREATE TABLE IF NOT EXISTS public.prompts_maestros (
  id             text        PRIMARY KEY,
  nombre         text        NOT NULL,
  descripcion    text,
  contenido      text        NOT NULL,
  es_editable    boolean     NOT NULL DEFAULT true,
  creado_en      timestamptz NOT NULL DEFAULT now(),
  actualizado_en timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.prompts_maestros IS
  'Biblioteca global de prompts maestros. Los productos referencian prompts_maestros.id vía productos.version_prompt.';

CREATE OR REPLACE FUNCTION public.prompts_maestros_touch_actualizado()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.actualizado_en = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prompts_maestros_actualizado ON public.prompts_maestros;
CREATE TRIGGER trg_prompts_maestros_actualizado
  BEFORE UPDATE ON public.prompts_maestros
  FOR EACH ROW
  EXECUTE FUNCTION public.prompts_maestros_touch_actualizado();

ALTER TABLE public.prompts_maestros ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS prompts_maestros_select_authenticated ON public.prompts_maestros;
CREATE POLICY prompts_maestros_select_authenticated
  ON public.prompts_maestros FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS prompts_maestros_insert_admin ON public.prompts_maestros;
CREATE POLICY prompts_maestros_insert_admin
  ON public.prompts_maestros FOR INSERT TO authenticated
  WITH CHECK (public.es_admin());

DROP POLICY IF EXISTS prompts_maestros_update_admin ON public.prompts_maestros;
CREATE POLICY prompts_maestros_update_admin
  ON public.prompts_maestros FOR UPDATE TO authenticated
  USING (public.es_admin())
  WITH CHECK (public.es_admin());

DROP POLICY IF EXISTS prompts_maestros_delete_admin ON public.prompts_maestros;
CREATE POLICY prompts_maestros_delete_admin
  ON public.prompts_maestros FOR DELETE TO authenticated
  USING (public.es_admin());

COMMIT;
