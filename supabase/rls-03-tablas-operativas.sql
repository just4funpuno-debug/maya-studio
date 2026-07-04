-- ============================================================
-- Maya Studio — RLS Pasos 3–8: tablas operativas (un solo bloque)
-- Requiere: rls-00, rls-01, rls-02 ejecutados antes.
-- ============================================================

-- ------------------------------------------------------------
-- productos
-- ------------------------------------------------------------
ALTER TABLE public.productos ENABLE ROW LEVEL SECURITY;

CREATE POLICY productos_select_asignados
  ON public.productos FOR SELECT TO authenticated
  USING (public.tiene_producto(id));

CREATE POLICY productos_insert_admin
  ON public.productos FOR INSERT TO authenticated
  WITH CHECK (public.es_admin());

CREATE POLICY productos_update_admin
  ON public.productos FOR UPDATE TO authenticated
  USING (public.es_admin())
  WITH CHECK (public.es_admin());

CREATE POLICY productos_update_creador_dia
  ON public.productos FOR UPDATE TO authenticated
  USING (
    NOT public.es_admin()
    AND public.tiene_producto(id)
  )
  WITH CHECK (
    NOT public.es_admin()
    AND public.tiene_producto(id)
  );

CREATE POLICY productos_delete_admin
  ON public.productos FOR DELETE TO authenticated
  USING (public.es_admin());

-- ------------------------------------------------------------
-- piezas
-- ------------------------------------------------------------
ALTER TABLE public.piezas ENABLE ROW LEVEL SECURITY;

CREATE POLICY piezas_select_asignados
  ON public.piezas FOR SELECT TO authenticated
  USING (public.tiene_producto(producto_id));

CREATE POLICY piezas_insert_asignados
  ON public.piezas FOR INSERT TO authenticated
  WITH CHECK (public.tiene_producto(producto_id));

CREATE POLICY piezas_delete_admin
  ON public.piezas FOR DELETE TO authenticated
  USING (public.es_admin());

CREATE POLICY piezas_update_asignados
  ON public.piezas FOR UPDATE TO authenticated
  USING (public.tiene_producto(producto_id))
  WITH CHECK (public.tiene_producto(producto_id));

-- ------------------------------------------------------------
-- producto_tipos
-- ------------------------------------------------------------
ALTER TABLE public.producto_tipos ENABLE ROW LEVEL SECURITY;

CREATE POLICY producto_tipos_select_asignados
  ON public.producto_tipos FOR SELECT TO authenticated
  USING (public.tiene_producto(producto_id));

CREATE POLICY producto_tipos_insert_admin
  ON public.producto_tipos FOR INSERT TO authenticated
  WITH CHECK (public.es_admin());

CREATE POLICY producto_tipos_update_admin
  ON public.producto_tipos FOR UPDATE TO authenticated
  USING (public.es_admin())
  WITH CHECK (public.es_admin());

CREATE POLICY producto_tipos_delete_admin
  ON public.producto_tipos FOR DELETE TO authenticated
  USING (public.es_admin());

-- ------------------------------------------------------------
-- actores
-- ------------------------------------------------------------
ALTER TABLE public.actores ENABLE ROW LEVEL SECURITY;

CREATE POLICY actores_select_asignados
  ON public.actores FOR SELECT TO authenticated
  USING (public.tiene_producto(producto_id));

CREATE POLICY actores_insert_admin
  ON public.actores FOR INSERT TO authenticated
  WITH CHECK (public.es_admin());

CREATE POLICY actores_update_admin
  ON public.actores FOR UPDATE TO authenticated
  USING (public.es_admin())
  WITH CHECK (public.es_admin());

CREATE POLICY actores_delete_admin
  ON public.actores FOR DELETE TO authenticated
  USING (public.es_admin());

-- ------------------------------------------------------------
-- fotos_producto
-- ------------------------------------------------------------
ALTER TABLE public.fotos_producto ENABLE ROW LEVEL SECURITY;

CREATE POLICY fotos_producto_select_asignados
  ON public.fotos_producto FOR SELECT TO authenticated
  USING (public.tiene_producto(producto_id));

CREATE POLICY fotos_producto_insert_admin
  ON public.fotos_producto FOR INSERT TO authenticated
  WITH CHECK (public.es_admin());

CREATE POLICY fotos_producto_update_admin
  ON public.fotos_producto FOR UPDATE TO authenticated
  USING (public.es_admin())
  WITH CHECK (public.es_admin());

CREATE POLICY fotos_producto_delete_admin
  ON public.fotos_producto FOR DELETE TO authenticated
  USING (public.es_admin());

-- ------------------------------------------------------------
-- producto_config_fotos
-- ------------------------------------------------------------
ALTER TABLE public.producto_config_fotos ENABLE ROW LEVEL SECURITY;

CREATE POLICY producto_config_fotos_select_asignados
  ON public.producto_config_fotos FOR SELECT TO authenticated
  USING (public.tiene_producto(producto_id));

CREATE POLICY producto_config_fotos_insert_admin
  ON public.producto_config_fotos FOR INSERT TO authenticated
  WITH CHECK (public.es_admin());

CREATE POLICY producto_config_fotos_update_admin
  ON public.producto_config_fotos FOR UPDATE TO authenticated
  USING (public.es_admin())
  WITH CHECK (public.es_admin());

CREATE POLICY producto_config_fotos_delete_admin
  ON public.producto_config_fotos FOR DELETE TO authenticated
  USING (public.es_admin());

-- ------------------------------------------------------------
-- tipos_contenido (catálogo — solo lectura)
-- ------------------------------------------------------------
ALTER TABLE public.tipos_contenido ENABLE ROW LEVEL SECURITY;

CREATE POLICY tipos_contenido_select_authenticated
  ON public.tipos_contenido FOR SELECT TO authenticated
  USING (true);
