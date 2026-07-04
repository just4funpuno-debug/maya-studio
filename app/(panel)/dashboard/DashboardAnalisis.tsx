import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { etiquetaNumeroCorto } from "@/lib/metricas/metas-vistas";
import type { AnalisisTipos, RankingTipo } from "@/lib/metricas/cargar-analisis-tipos";

type Props = {
  datos: AnalisisTipos;
};

type RedConfig = {
  id: keyof AnalisisTipos;
  nombre: string;
  color: string;
  bgBar: string;
  textColor: string;
};

const REDES: RedConfig[] = [
  {
    id: "tiktok",
    nombre: "TikTok",
    color: "#22d3ee",
    bgBar: "bg-cyan-400",
    textColor: "text-cyan-400",
  },
  {
    id: "instagram",
    nombre: "Instagram",
    color: "#ec4899",
    bgBar: "bg-pink-400",
    textColor: "text-pink-400",
  },
  {
    id: "facebook",
    nombre: "Facebook",
    color: "#3b82f6",
    bgBar: "bg-blue-400",
    textColor: "text-blue-400",
  },
];

function ColumnaRed({ red, ranking }: { red: RedConfig; ranking: RankingTipo[] }) {
  const top5 = ranking.slice(0, 5);
  const maxPromedio = top5[0]?.promedio ?? 1;

  return (
    <div className="flex flex-col gap-2">
      <h4 className={`text-xs font-semibold uppercase tracking-wide ${red.textColor}`}>
        {red.nombre}
      </h4>

      {top5.length === 0 ? (
        <p className="py-4 text-center text-xs text-panel-text-muted">
          Sin datos aún
        </p>
      ) : (
        <div className="flex flex-col gap-2.5">
          {top5.map((item) => {
            const porcentaje = Math.max((item.promedio / maxPromedio) * 100, 5);
            return (
              <div key={item.tipo} className="flex flex-col gap-0.5">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="truncate text-xs text-panel-text">
                    {item.tipo}
                  </span>
                  <span className={`shrink-0 text-xs font-semibold ${red.textColor}`}>
                    ~{etiquetaNumeroCorto(item.promedio)}
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-panel-bg-alt">
                  <div
                    className={`h-full rounded-full ${red.bgBar} opacity-75`}
                    style={{ width: `${porcentaje}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function DashboardAnalisis({ datos }: Props) {
  const hayDatos = datos.tiktok.length > 0 || datos.instagram.length > 0 || datos.facebook.length > 0;

  if (!hayDatos) return null;

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="h-4 w-1 rounded-full bg-accent" aria-hidden />
          <h3 className="text-sm font-semibold text-panel-text">
            Qué funciona en cada red
          </h3>
        </div>
        <Link
          href="/analisis"
          className="flex items-center gap-1 text-xs text-panel-text-muted transition-colors hover:text-accent"
        >
          Ver análisis completo
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="grid gap-5 rounded-xl border border-panel-border bg-[var(--surface-2)] p-5 md:grid-cols-3">
        {REDES.map((red) => (
          <ColumnaRed key={red.id} red={red} ranking={datos[red.id]} />
        ))}
      </div>
    </section>
  );
}
