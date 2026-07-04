-- ============================================================
-- Maya Studio — RLS Paso 1: public.usuarios
-- Requiere: rls-00-helper-functions.sql ejecutado antes.
-- ============================================================

ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;

CREATE POLICY usuarios_select_propia_o_admin
  ON public.usuarios
  FOR SELECT
  TO authenticated
  USING (
    auth_user_id = auth.uid()
    OR public.es_admin()
  );
