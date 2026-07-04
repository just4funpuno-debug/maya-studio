export const META_VISTAS_MAS_100K = 100001 as const;

export type RedSocialMeta = "tiktok" | "instagram" | "facebook";

export type MetaVistasDef = {
  valor: number;
  etiqueta: string;
};

/** Escalera única de metas de vistas (fuente de verdad). */
export const ESCALERA_METAS_VISTAS: MetaVistasDef[] = [
  { valor: 250, etiqueta: "250" },
  { valor: 500, etiqueta: "500" },
  { valor: 1000, etiqueta: "1k" },
  { valor: 3000, etiqueta: "3k" },
  { valor: 5000, etiqueta: "5k" },
  { valor: 10000, etiqueta: "10k" },
  { valor: 30000, etiqueta: "30k" },
  { valor: 50000, etiqueta: "50k" },
  { valor: 80000, etiqueta: "80k" },
  { valor: 100000, etiqueta: "100k" },
  { valor: META_VISTAS_MAS_100K, etiqueta: "+100k" },
];

export const VALORES_METAS_VISTAS = ESCALERA_METAS_VISTAS.map((m) => m.valor);

export const REDES_SOCIALES_META: {
  id: RedSocialMeta;
  nombre: string;
  columna: keyof MetasVistasPieza;
}[] = [
  { id: "tiktok", nombre: "TikTok", columna: "meta_vistas_tiktok" },
  { id: "instagram", nombre: "Instagram", columna: "meta_vistas_instagram" },
  { id: "facebook", nombre: "Facebook", columna: "meta_vistas_facebook" },
];

export type MetasVistasPieza = {
  meta_vistas_tiktok: number | null;
  meta_vistas_instagram: number | null;
  meta_vistas_facebook: number | null;
};

export function metaVistasValida(valor: number | null | undefined): boolean {
  if (valor == null) return true;
  return VALORES_METAS_VISTAS.includes(valor);
}

export function etiquetaMetaVistas(valor: number | null | undefined): string | null {
  if (valor == null) return null;
  const meta = ESCALERA_METAS_VISTAS.find((m) => m.valor === valor);
  return meta?.etiqueta ?? String(valor);
}

export function resumenMetaAlcanzada(valor: number | null | undefined): string {
  const etiqueta = etiquetaMetaVistas(valor);
  if (!etiqueta) return "Sin marcar";
  return `Alcanzó ${etiqueta}`;
}

export function indiceMeta(valor: number | null | undefined): number {
  if (valor == null) return -1;
  return ESCALERA_METAS_VISTAS.findIndex((m) => m.valor === valor);
}

/** Meta anterior en la escalera, o null si no hay / era la primera. */
export function metaAnterior(valor: number | null | undefined): number | null {
  const idx = indiceMeta(valor);
  if (idx <= 0) return null;
  return ESCALERA_METAS_VISTAS[idx - 1].valor;
}

export function metaPorRed(
  metas: MetasVistasPieza,
  red: RedSocialMeta
): number | null {
  switch (red) {
    case "tiktok":
      return metas.meta_vistas_tiktok;
    case "instagram":
      return metas.meta_vistas_instagram;
    case "facebook":
      return metas.meta_vistas_facebook;
  }
}

export function columnaPorRed(red: RedSocialMeta): keyof MetasVistasPieza {
  return REDES_SOCIALES_META.find((r) => r.id === red)!.columna;
}

/** Formatea un número de vistas como etiqueta corta (ej: 2.3k, 45k). */
export function etiquetaNumeroCorto(valor: number): string {
  const exacta = ESCALERA_METAS_VISTAS.find((m) => m.valor === valor);
  if (exacta) return exacta.etiqueta;

  if (valor >= 1000) {
    const k = valor / 1000;
    return k >= 10 ? `${Math.round(k)}k` : `${k.toFixed(1).replace(/\.0$/, "")}k`;
  }
  return String(Math.round(valor));
}

export function tieneAlgunaMeta(metas: MetasVistasPieza): boolean {
  return (
    metas.meta_vistas_tiktok != null ||
    metas.meta_vistas_instagram != null ||
    metas.meta_vistas_facebook != null
  );
}
