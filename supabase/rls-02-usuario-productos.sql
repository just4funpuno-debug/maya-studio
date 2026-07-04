-- ============================================================
-- Maya Studio — RLS Paso 2: public.usuario_productos
-- Requiere: rls-00-helper-functions.sql y rls-01-usuarios.sql
-- ============================================================

ALTER TABLE public.usuario_productos ENABLE ROW LEVEL SECURITY;

CREATE POLICY usuario_productos_select_propias_o_admin
  ON public.usuario_productos
  FOR SELECT
  TO authenticated
  USING (
    usuario_id = public.mi_usuario_id()
    OR public.es_admin()
  );

CREATE POLICY usuario_productos_insert_admin
  ON public.usuario_productos
  FOR INSERT
  TO authenticated
  WITH CHECK (public.es_admin());

CREATE POLICY usuario_productos_delete_admin
  ON public.usuario_productos
  FOR DELETE
  TO authenticated
  USING (public.es_admin());
