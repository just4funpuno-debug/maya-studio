-- ============================================================
-- Maya Studio — Storage: quitar listado público de objetos
-- Buckets: productos, actores
--
-- Problema (advisor de Supabase: public_bucket_allows_listing):
-- Las policies *_public_read tenían SELECT abierto a "public" (incluye
-- anon) sin restricción sobre el nombre del objeto, lo que permite
-- list() de TODO el contenido del bucket sin sesión, no solo lectura
-- por URL conocida.
--
-- Los buckets ya están marcados como public=true a nivel de bucket,
-- así que getPublicUrl() sigue funcionando igual para las <img> de la
-- app: ese endpoint (/object/public/...) no depende de estas policies
-- de RLS. Lo único que dependía de la policy SELECT era list(), usado
-- solo en lib/storage/borrar-archivos-producto.ts (limpieza al borrar
-- un producto, ya protegida por requiereAdmin()).
--
-- Ejecutar en Supabase → SQL Editor (o vía MCP / apply_migration)
-- ============================================================

BEGIN;

-- Quitar el SELECT público que permite listar todo el contenido del bucket
DROP POLICY IF EXISTS "productos_public_read" ON storage.objects;
DROP POLICY IF EXISTS "actores_public_read" ON storage.objects;

-- Reemplazar por SELECT solo para admin autenticado
-- (necesario únicamente para list() en la limpieza de storage al eliminar un producto)
CREATE POLICY "productos_admin_select"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'productos'
  AND public.es_admin()
);

CREATE POLICY "actores_admin_select"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'actores'
  AND public.es_admin()
);

COMMIT;
