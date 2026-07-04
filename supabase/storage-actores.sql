-- ============================================================
-- Maya Studio — Storage: bucket "actores"
-- ============================================================
-- PASO 1 (manual en Dashboard):
--   Storage → New bucket → nombre: actores → Public bucket ✅
--
-- PASO 2: ejecutar este SQL en SQL Editor
-- ============================================================

-- Lectura pública (miniaturas en el panel)
CREATE POLICY "actores_public_read"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'actores');

-- Subir imágenes (anon hasta tener autenticación)
CREATE POLICY "actores_anon_insert"
ON storage.objects FOR INSERT
TO anon
WITH CHECK (bucket_id = 'actores');

-- Borrar imágenes al eliminar actor (anon hasta tener autenticación)
CREATE POLICY "actores_anon_delete"
ON storage.objects FOR DELETE
TO anon
USING (bucket_id = 'actores');
