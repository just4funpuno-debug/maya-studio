-- ============================================================
-- Maya Studio — Rate limit de generaciones IA (Arreglo 3)
--
-- Problema: generarPiezaAction y generarActorAction no tenían
-- protección server-side contra llamadas repetidas — se podían
-- invocar en bucle fuera de la UI y quemar la cuenta de Anthropic.
-- Ninguna de las dos escribe en piezas/actores al generar (eso pasa
-- recién al aprobar/guardar), así que no se podía usar el conteo de
-- esas tablas como proxy.
--
-- Solución: ventana fija de 30 generaciones (piezas + actores
-- combinadas) cada 10 minutos por usuario, guardada en 2 columnas
-- de usuarios. Como usuarios solo tiene policy de SELECT (sin
-- UPDATE para authenticated), el chequeo/incremento se hace vía una
-- función SECURITY DEFINER — mismo patrón que es_admin()/
-- tiene_producto() en rls-00-helper-functions.sql — en vez de abrir
-- una policy de UPDATE amplia sobre la tabla.
--
-- Límite y ventana están como constantes en
-- lib/motor/limite-generaciones.ts (LIMITE_GENERACIONES,
-- VENTANA_MINUTOS), pasadas como parámetros a la función.
--
-- Ejecutar en Supabase → SQL Editor (o vía MCP / apply_migration)
-- ============================================================

ALTER TABLE public.usuarios
  ADD COLUMN generaciones_ventana_inicio timestamptz,
  ADD COLUMN generaciones_ventana_count integer NOT NULL DEFAULT 0;

CREATE OR REPLACE FUNCTION public.verificar_limite_generacion(
  p_limite integer,
  p_ventana_minutos integer
)
RETURNS TABLE (permitido boolean, segundos_restantes integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_usuario_id uuid;
  v_inicio timestamptz;
  v_count integer;
  v_ahora timestamptz := now();
BEGIN
  v_usuario_id := public.mi_usuario_id();

  IF v_usuario_id IS NULL THEN
    RETURN QUERY SELECT false, 0;
    RETURN;
  END IF;

  -- Bloquea la fila del usuario para serializar llamadas simultáneas
  -- (evita que dos requests casi al mismo tiempo pasen el chequeo juntas)
  SELECT generaciones_ventana_inicio, generaciones_ventana_count
    INTO v_inicio, v_count
    FROM public.usuarios
   WHERE id = v_usuario_id
   FOR UPDATE;

  -- Ventana vencida o primera vez: arrancar ventana nueva
  IF v_inicio IS NULL OR v_ahora - v_inicio > (p_ventana_minutos || ' minutes')::interval THEN
    UPDATE public.usuarios
       SET generaciones_ventana_inicio = v_ahora,
           generaciones_ventana_count = 1
     WHERE id = v_usuario_id;
    RETURN QUERY SELECT true, 0;
    RETURN;
  END IF;

  -- Dentro de la ventana, límite alcanzado
  IF v_count >= p_limite THEN
    RETURN QUERY SELECT false,
      GREATEST(0, CEIL(EXTRACT(EPOCH FROM (v_inicio + (p_ventana_minutos || ' minutes')::interval - v_ahora))))::integer;
    RETURN;
  END IF;

  -- Dentro de la ventana, todavía hay cupo
  UPDATE public.usuarios
     SET generaciones_ventana_count = generaciones_ventana_count + 1
   WHERE id = v_usuario_id;

  RETURN QUERY SELECT true, 0;
END;
$$;

REVOKE ALL ON FUNCTION public.verificar_limite_generacion(integer, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.verificar_limite_generacion(integer, integer) TO authenticated;

-- Nota: en este proyecto los privilegios por defecto del schema public
-- otorgan EXECUTE a "anon" en toda función nueva apenas se crea, ANTES
-- de que corra el REVOKE FROM PUBLIC de arriba (revocar de PUBLIC no
-- alcanza para quitarle el permiso a anon específicamente). Por eso
-- hace falta este REVOKE explícito y adicional:
REVOKE EXECUTE ON FUNCTION public.verificar_limite_generacion(integer, integer) FROM anon;
