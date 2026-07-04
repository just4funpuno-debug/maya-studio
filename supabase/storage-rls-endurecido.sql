-- ============================================================
-- Maya Studio — Storage RLS endurecido
-- Buckets: productos, actores
--
-- Requiere: public.es_admin() (rls-00-helper-functions.sql)
-- Mantiene: lectura pública (productos_public_read, actores_public_read)
-- Quita:    INSERT/DELETE anon (hueco de seguridad)
-- Añade:    INSERT/UPDATE/DELETE solo authenticated + es_admin()
--
-- Ejecutar en Supabase → SQL Editor (o vía MCP / run-sql.cjs)
-- ============================================================

BEGIN;

-- --- Quitar políticas temporales de anon ---

DROP POLICY IF EXISTS "productos_anon_insert" ON storage.objects;
DROP POLICY IF EXISTS "productos_anon_delete" ON storage.objects;
DROP POLICY IF EXISTS "actores_anon_insert" ON storage.objects;
DROP POLICY IF EXISTS "actores_anon_delete" ON storage.objects;

-- --- Bucket: productos (escritura solo admin autenticado) ---

CREATE POLICY "productos_admin_insert"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'productos'
  AND public.es_admin()
);

CREATE POLICY "productos_admin_update"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'productos'
  AND public.es_admin()
)
WITH CHECK (
  bucket_id = 'productos'
  AND public.es_admin()
);

CREATE POLICY "productos_admin_delete"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'productos'
  AND public.es_admin()
);

-- --- Bucket: actores (escritura solo admin autenticado) ---

CREATE POLICY "actores_admin_insert"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'actores'
  AND public.es_admin()
);

CREATE POLICY "actores_admin_update"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'actores'
  AND public.es_admin()
)
WITH CHECK (
  bucket_id = 'actores'
  AND public.es_admin()
);

CREATE POLICY "actores_admin_delete"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'actores'
  AND public.es_admin()
);

COMMIT;
