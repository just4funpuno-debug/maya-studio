export type ModeloIa = {
  id: string;
  nombre: string;
  descripcion: string;
  /** Texto para UI, ej. "~US$ 0.03 / pieza" */
  precioEstimadoPieza: string;
  precioInputMt: number;
  precioOutputMt: number;
  notaPrecio?: string;
};

/** Tokens aproximados por generación (prompt maestro + contexto + JSON de salida). */
const TOKENS_ENTRADA_ESTIMADOS = 18_000;
const TOKENS_SALIDA_ESTIMADOS = 3_000;

function estimarPrecioPieza(inputMt: number, outputMt: number): string {
  const usd =
    (TOKENS_ENTRADA_ESTIMADOS / 1_000_000) * inputMt +
    (TOKENS_SALIDA_ESTIMADOS / 1_000_000) * outputMt;
  const redondeado = Math.round(usd * 100) / 100;
  return `~US$ ${redondeado.toFixed(2)} / pieza`;
}

export const MODELOS_IA: ModeloIa[] = [
  {
    id: "claude-haiku-4-5",
    nombre: "Haiku 4.5 (económico)",
    descripcion: "Rápido y barato, ideal para volumen diario.",
    precioInputMt: 1,
    precioOutputMt: 5,
    precioEstimadoPieza: estimarPrecioPieza(1, 5),
  },
  {
    id: "claude-sonnet-5",
    nombre: "Sonnet 5 (equilibrado)",
    descripcion:
      "Mejor balance calidad y precio. Tarifa de lanzamiento hasta el 31 ago 2026.",
    precioInputMt: 2,
    precioOutputMt: 10,
    precioEstimadoPieza: estimarPrecioPieza(2, 10),
    notaPrecio: "Después del 31 ago 2026: US$ 3 / US$ 15 por millón (~US$ 0.10 / pieza).",
  },
  {
    id: "claude-opus-4-8",
    nombre: "Opus 4.8 (máxima calidad)",
    descripcion: "Flagship actual: máximo razonamiento creativo, mayor costo.",
    precioInputMt: 5,
    precioOutputMt: 25,
    precioEstimadoPieza: estimarPrecioPieza(5, 25),
  },
];

export const MODELO_IA_POR_DEFECTO = "claude-haiku-4-5";

export function modeloPorId(id: string): ModeloIa | undefined {
  return MODELOS_IA.find((m) => m.id === id);
}

export function etiquetaModelo(id: string): string {
  return modeloPorId(id)?.nombre ?? id;
}

export function resolverModeloIa(id: string | null | undefined): {
  modelo: ModeloIa;
  usoFallback: boolean;
  idSolicitado: string | null;
} {
  const idSolicitado = id?.trim() || null;
  const delCatalogo = idSolicitado ? modeloPorId(idSolicitado) : undefined;
  const modelo = delCatalogo ?? modeloPorId(MODELO_IA_POR_DEFECTO)!;

  return {
    modelo,
    usoFallback: !delCatalogo || delCatalogo.id !== idSolicitado,
    idSolicitado,
  };
}
