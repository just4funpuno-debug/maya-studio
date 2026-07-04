-- ============================================================
-- Maya Studio — RLS Paso 0: funciones helper
-- NO activa RLS en ninguna tabla.
-- Ejecutar en Supabase → SQL Editor (o vía MCP)
-- ============================================================

-- Vincula el JWT (auth.uid()) con la fila en public.usuarios
CREATE OR REPLACE FUNCTION public.mi_usuario_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id
  FROM public.usuarios
  WHERE auth_user_id = auth.uid()
  LIMIT 1;
$$;

COMMENT ON FUNCTION public.mi_usuario_id() IS
  'Devuelve usuarios.id del usuario logueado. NULL sin sesión o sin perfil.';

-- true si el usuario actual tiene rol admin en public.usuarios
CREATE OR REPLACE FUNCTION public.es_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.usuarios
    WHERE auth_user_id = auth.uid()
      AND rol = 'admin'
  );
$$;

COMMENT ON FUNCTION public.es_admin() IS
  'true si auth.uid() corresponde a un usuario con rol admin.';

-- Admin: todos los productos. Creador: solo asignados en usuario_productos.
CREATE OR REPLACE FUNCTION public.tiene_producto(p_producto_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    CASE
      WHEN p_producto_id IS NULL THEN false
      WHEN public.es_admin() THEN true
      ELSE EXISTS (
        SELECT 1
        FROM public.usuario_productos up
        WHERE up.usuario_id = public.mi_usuario_id()
          AND up.producto_id = p_producto_id
      )
    END;
$$;

COMMENT ON FUNCTION public.tiene_producto(uuid) IS
  'true si el usuario puede acceder al producto (admin o asignación en usuario_productos).';

-- Permisos de ejecución (solo roles con JWT; anon sin acceso directo)
REVOKE ALL ON FUNCTION public.mi_usuario_id() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.es_admin() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.tiene_producto(uuid) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.mi_usuario_id() TO authenticated;
GRANT EXECUTE ON FUNCTION public.es_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.tiene_producto(uuid) TO authenticated;

GRANT EXECUTE ON FUNCTION public.mi_usuario_id() TO service_role;
GRANT EXECUTE ON FUNCTION public.es_admin() TO service_role;
GRANT EXECUTE ON FUNCTION public.tiene_producto(uuid) TO service_role;
