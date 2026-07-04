ALTER TABLE productos
ADD COLUMN publico text NOT NULL DEFAULT 'unisex'
CHECK (publico IN ('unisex', 'hombres', 'mujeres'));
