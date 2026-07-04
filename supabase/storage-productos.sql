-- ============================================================
-- Maya Studio — Storage: bucket "productos"
-- ============================================================
-- PASO MANUAL (Dashboard):
--   Storage → New bucket → nombre: productos → Public bucket ✅
--
-- PASO SQL: ejecutar DESPUÉS de crear el bucket
-- ============================================================

CREATE POLICY "productos_public_read"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'productos');

CREATE POLICY "productos_anon_insert"
ON storage.objects FOR INSERT
TO anon
WITH CHECK (bucket_id = 'productos');

CREATE POLICY "productos_anon_delete"
ON storage.objects FOR DELETE
TO anon
USING (bucket_id = 'productos');
