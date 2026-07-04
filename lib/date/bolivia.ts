const BOLIVIA_TZ = "America/La_Paz";

export type BoliviaDayBounds = {
  /** Inicio del día en Bolivia (00:00), en ISO UTC */
  startIso: string;
  /** Inicio del día siguiente en Bolivia, en ISO UTC (límite exclusivo) */
  endIso: string;
};

/**
 * Rango [start, end) del día calendario actual en America/La_Paz,
 * expresado en UTC para filtrar columnas timestamptz en Supabase.
 */
export function getBoliviaDayBoundsUtc(now = new Date()): BoliviaDayBounds {
  const fechaLocal = new Intl.DateTimeFormat("en-CA", {
    timeZone: BOLIVIA_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);

  const start = new Date(`${fechaLocal}T00:00:00-04:00`);
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);

  return {
    startIso: start.toISOString(),
    endIso: end.toISOString(),
  };
}

const BOLIVIA_LOCALE = "es-BO";

function fechaCalendarioBolivia(date: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: BOLIVIA_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

/**
 * "Hoy", "Ayer" o fecha corta en español (zona Bolivia).
 */
export function formatearFechaRelativaBolivia(
  iso: string,
  now = new Date()
): string {
  const fecha = new Date(iso);
  if (Number.isNaN(fecha.getTime())) return "";

  const hoy = fechaCalendarioBolivia(now);
  const diaPieza = fechaCalendarioBolivia(fecha);

  if (diaPieza === hoy) return "Hoy";

  const ayer = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  if (diaPieza === fechaCalendarioBolivia(ayer)) return "Ayer";

  return new Intl.DateTimeFormat(BOLIVIA_LOCALE, {
    timeZone: BOLIVIA_TZ,
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(fecha);
}

/** Primer instante del mes calendario actual en Bolivia (00:00), en ISO UTC. */
export function getBoliviaMonthStartUtc(now = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: BOLIVIA_TZ,
    year: "numeric",
    month: "2-digit",
  }).formatToParts(now);

  const year = parts.find((p) => p.type === "year")?.value ?? "1970";
  const month = parts.find((p) => p.type === "month")?.value ?? "01";

  return new Date(`${year}-${month}-01T00:00:00-04:00`).toISOString();
}

/** Inicio del rango “últimos 7 días” (hoy 00:00 Bolivia − 7 días), en ISO UTC. */
export function getBoliviaWeekStartUtc(now = new Date()): string {
  const { startIso } = getBoliviaDayBoundsUtc(now);
  const start = new Date(startIso);
  return new Date(start.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
}

/**
 * Inicio de ventana de N días calendario inclusivos en Bolivia (hoy + N−1 anteriores),
 * en ISO UTC. Ej.: dias=11 → piezas desde hace 10 días a las 00:00 La Paz.
 */
export function getBoliviaVentanaRecienteInicioUtc(
  dias = 11,
  now = new Date()
): string {
  const { startIso } = getBoliviaDayBoundsUtc(now);
  const start = new Date(startIso);
  return new Date(
    start.getTime() - Math.max(0, dias - 1) * 24 * 60 * 60 * 1000
  ).toISOString();
}

/** Fecha de hoy en español, ej. "miércoles, 2 de julio de 2026". */
export function formatearFechaHoyBolivia(now = new Date()): string {
  const texto = new Intl.DateTimeFormat(BOLIVIA_LOCALE, {
    timeZone: BOLIVIA_TZ,
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(now);

  return texto.charAt(0).toUpperCase() + texto.slice(1);
}
