ALTER TABLE actores
ADD COLUMN identidad jsonb,
ADD COLUMN descripcion_fisica jsonb,
ADD COLUMN prompt_carrusel text,
ADD COLUMN notas text;
