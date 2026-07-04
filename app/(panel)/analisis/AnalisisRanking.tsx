"use client";

import { useState } from "react";
import { Clapperboard, Aperture, Share2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { RedSocialMeta } from "@/lib/metricas/metas-vistas";
import { etiquetaNumeroCorto } from "@/lib/metricas/metas-vistas";
import type { AnalisisTipos, RankingTipo } from "@/lib/metricas/cargar-analisis-tipos";

type Props = {
  datos: AnalisisTipos;
};

type RedTab = {
  id: RedSocialMeta;
  nombre: string;
  color: string;
  bgBar: string;
  icon: LucideIcon;
};

const TABS_RED: RedTab[] = [
  {
    id: "tiktok",
    nombre: "TikTok",
    color: "text-cyan-400",
    bgBar: "bg-cyan-400",
    icon: Clapperboard,
  },
  {
    id: "instagram",
    nombre: "Instagram",
    color: "text-fuchsia-400",
    bgBar: "bg-fuchsia-400",
    icon: Aperture,
  },
  {
    id: "facebook",
    nombre: "Facebook",
    color: "text-blue-400",
    bgBar: "bg-blue-400",
    icon: Share2,
  },
];

function RankingVacio() {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-panel-border bg-panel-bg p-10 text-center">
      <p className="text-sm text-panel-text-muted">
        Aún no hay suficientes datos.
      </p>
      <p className="text-xs text-panel-text-muted">
        Marca las vistas de tus piezas para ver el análisis.
      </p>
    </div>
  );
}

function RankingLista({
  ranking,
  tab,
}: {
  ranking: RankingTipo[];
  tab: RedTab;
}) {
  const maxPromedio = ranking[0]?.promedio ?? 1;

  return (
    <div className="flex flex-col gap-3">
      {ranking.map((item) => {
        const porcentaje = Math.max((item.promedio / maxPromedio) * 100, 4);
        return (
          <div key={item.tipo} className="flex flex-col gap-1">
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-sm font-medium text-panel-text">
                {item.tipo}
              </span>
              <span className="whitespace-nowrap text-xs text-panel-text-muted">
                {item.conteo} pieza{item.conteo !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-5 flex-1 overflow-hidden rounded-sm bg-panel-bg-alt">
                <div
                  className={`h-full rounded-sm ${tab.bgBar} opacity-80 transition-all`}
                  style={{ width: `${porcentaje}%` }}
                />
              </div>
              <span
                className={`min-w-[3rem] text-right text-xs font-semibold ${tab.color}`}
              >
                ~{etiquetaNumeroCorto(item.promedio)}
              </span>
            </div>
          </div>
        );
      })}

      <p className="mt-4 border-t border-panel-border pt-3 text-xs text-panel-text-muted">
        Mejor tipo:{" "}
        <span className={`font-semibold ${tab.color}`}>
          {ranking[0].tipo}
        </span>{" "}
        (~{etiquetaNumeroCorto(ranking[0].promedio)} vistas promedio)
      </p>
    </div>
  );
}

export function AnalisisRanking({ datos }: Props) {
  const [redActiva, setRedActiva] = useState<RedSocialMeta>("tiktok");

  const tabActiva = TABS_RED.find((t) => t.id === redActiva)!;
  const ranking = datos[redActiva];

  return (
    <div className="flex flex-col gap-4">
      {/* Pestañas de red */}
      <div className="flex gap-1 rounded-lg border border-panel-border bg-panel-bg p-1">
        {TABS_RED.map((tab) => {
          const activa = tab.id === redActiva;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setRedActiva(tab.id)}
              className={`flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                activa
                  ? `bg-panel-bg-alt ${tab.color}`
                  : "text-panel-text-muted hover:text-panel-text"
              }`}
            >
              <Icon size={15} />
              {tab.nombre}
            </button>
          );
        })}
      </div>

      {/* Contenido */}
      <div className="rounded-lg border border-panel-border bg-panel-bg p-5">
        {ranking.length === 0 ? (
          <RankingVacio />
        ) : (
          <RankingLista ranking={ranking} tab={tabActiva} />
        )}
      </div>
    </div>
  );
}
