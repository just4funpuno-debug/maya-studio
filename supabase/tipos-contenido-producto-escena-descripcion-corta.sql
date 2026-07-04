-- Acortar descripción: Producto en escena (voz en off)
BEGIN;

UPDATE public.tipos_contenido
SET descripcion = 'El producto como protagonista, con voz en off'
WHERE id = '8f7c3490-42aa-482d-ab56-2a9b53c819d8';

COMMIT;
