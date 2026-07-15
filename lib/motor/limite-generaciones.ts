import { createClient } from "@/lib/supabase/server";

export const LIMITE_GENERACIONES = 30;
export const VENTANA_MINUTOS = 10;

export type LimiteGeneracionResult = { ok: true } | { ok: false; error: string };

export async function verificarLimiteGeneracion(): Promise<LimiteGeneracionResult> {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("verificar_limite_generacion", {
    p_limite: LIMITE_GENERACIONES,
    p_ventana_minutos: VENTANA_MINUTOS,
  });

  if (error) {
    return { ok: false, error: "No se pudo verificar el límite de generación. Intenta de nuevo." };
  }

  const fila = data?.[0];
  if (!fila?.permitido) {
    const minutos = Math.max(1, Math.ceil((fila?.segundos_restantes ?? VENTANA_MINUTOS * 60) / 60));
    return {
      ok: false,
      error: `Alcanzaste el límite de ${LIMITE_GENERACIONES} generaciones en ${VENTANA_MINUTOS} minutos. Podés volver a generar en ${minutos} minuto${minutos === 1 ? "" : "s"}.`,
    };
  }

  return { ok: true };
}
