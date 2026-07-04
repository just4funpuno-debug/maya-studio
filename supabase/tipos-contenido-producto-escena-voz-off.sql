-- Maya Studio — Tipo nuevo: Producto en escena (voz en off)
BEGIN;

INSERT INTO public.tipos_contenido (nombre, descripcion, tipo_salida)
VALUES (
  'Producto en escena (voz en off)',
  'El producto como protagonista visual, con locución en off y música de fondo. Movimiento de cámara constante (giros lentos, acercamientos, cambios de ángulo cada 2-3 segundos), puede mostrar las cápsulas servidas en platito o mano. Sin actor hablando a cámara. CLAVE: no es un comercial bonito y vacío que la gente pasa de largo; debe ENSEÑAR algo o RESOLVER un problema mientras muestra el producto (ángulo educativo o problema/solución). Gancho fuerte en los primeros 3 segundos. Estilo cinematográfico pero natural y auténtico, no comercial de TV pulido.',
  'prompts'
);

COMMIT;
