export type CalendarioProducto = {
  dia_actual: number;
  ciclo_actual: number;
};

export type ResultadoAvanceCalendario = {
  dia_actual: number;
  ciclo_actual: number;
  cambioCiclo: boolean;
  /** Ciclo que se cerró al pasar de día 31 a día 1 del siguiente. */
  cicloCompletado: number | null;
};

/** Avanza el calendario tras aprobar una pieza (ciclos de 31 días, sin tope de ciclos). */
export function avanzarCalendarioProducto(
  cal: CalendarioProducto
): ResultadoAvanceCalendario {
  if (cal.dia_actual === 31) {
    return {
      dia_actual: 1,
      ciclo_actual: cal.ciclo_actual + 1,
      cambioCiclo: true,
      cicloCompletado: cal.ciclo_actual,
    };
  }

  return {
    dia_actual: cal.dia_actual + 1,
    ciclo_actual: cal.ciclo_actual,
    cambioCiclo: false,
    cicloCompletado: null,
  };
}

/** Etiqueta de mezcla de contenido para el prompt del motor. */
export function etapaMezclaContenido(cicloActual: number): string {
  if (cicloActual <= 1) return "Ciclo 1";
  if (cicloActual === 2) return "Ciclo 2";
  return "Ciclo 3+ (mezcla madura)";
}
