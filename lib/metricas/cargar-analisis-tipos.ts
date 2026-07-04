import type { SupabaseClient } from "@supabase/supabase-js";
import type { RedSocialMeta } from "./metas-vistas";

export type RankingTipo = {
  tipo: string;
  promedio: number;
  conteo: number;
};

export type AnalisisTipos = Record<RedSocialMeta, RankingTipo[]>;

type PiezaMetaRow = {
  tipo_contenido: string | null;
  meta_vistas_tiktok: number | null;
  meta_vistas_instagram: number | null;
  meta_vistas_facebook: number | null;
};

const COLUMNA_RED: Record<RedSocialMeta, keyof PiezaMetaRow> = {
  tiktok: "meta_vistas_tiktok",
  instagram: "meta_vistas_instagram",
  facebook: "meta_vistas_facebook",
};

const REDES: RedSocialMeta[] = ["tiktok", "instagram", "facebook"];

export async function cargarAnalisisTipos(
  supabase: SupabaseClient
): Promise<{ datos: AnalisisTipos; error?: string }> {
  const { data, error } = await supabase
    .from("piezas")
    .select(
      "tipo_contenido, meta_vistas_tiktok, meta_vistas_instagram, meta_vistas_facebook"
    )
    .or(
      "meta_vistas_tiktok.not.is.null,meta_vistas_instagram.not.is.null,meta_vistas_facebook.not.is.null"
    );

  if (error) {
    return {
      datos: { tiktok: [], instagram: [], facebook: [] },
      error: error.message,
    };
  }

  const piezas = (data ?? []) as PiezaMetaRow[];

  const resultado: AnalisisTipos = { tiktok: [], instagram: [], facebook: [] };

  for (const red of REDES) {
    const col = COLUMNA_RED[red];

    const acumulador = new Map<string, { suma: number; conteo: number }>();

    for (const pieza of piezas) {
      const tipo = pieza.tipo_contenido;
      if (!tipo) continue;

      const valor = pieza[col] as number | null;
      if (valor == null) continue;

      const actual = acumulador.get(tipo) ?? { suma: 0, conteo: 0 };
      actual.suma += valor;
      actual.conteo += 1;
      acumulador.set(tipo, actual);
    }

    const ranking: RankingTipo[] = [];
    for (const [tipo, { suma, conteo }] of acumulador) {
      ranking.push({ tipo, promedio: suma / conteo, conteo });
    }

    ranking.sort((a, b) => b.promedio - a.promedio);
    resultado[red] = ranking;
  }

  return { datos: resultado };
}
