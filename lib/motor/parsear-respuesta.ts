export type ResultadoParseoJson =
  | { ok: true; data: Record<string, unknown> }
  | { ok: false; raw: string; parseError: string };

/** Limpia fences markdown y parsea JSON de forma segura. */
export function parsearRespuestaJson(texto: string): ResultadoParseoJson {
  let limpio = texto.trim();

  // Quitar bloques ```json ... ``` o ``` ... ```
  const fenceMatch = limpio.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  if (fenceMatch) {
    limpio = fenceMatch[1].trim();
  } else {
    limpio = limpio.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
  }

  // Si hay texto antes/después del JSON, intentar extraer el objeto
  const firstBrace = limpio.indexOf("{");
  const lastBrace = limpio.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    limpio = limpio.slice(firstBrace, lastBrace + 1);
  }

  try {
    const data = JSON.parse(limpio) as Record<string, unknown>;
    if (typeof data !== "object" || data === null || Array.isArray(data)) {
      return {
        ok: false,
        raw: texto,
        parseError: "La respuesta no es un objeto JSON.",
      };
    }
    return { ok: true, data };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error de parseo";
    return { ok: false, raw: texto, parseError: msg };
  }
}
