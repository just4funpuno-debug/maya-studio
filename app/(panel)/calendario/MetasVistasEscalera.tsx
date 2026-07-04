"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Aperture,
  Clapperboard,
  ChevronDown,
  Loader2,
  Share2,
  TrendingUp,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  columnaPorRed,
  ESCALERA_METAS_VISTAS,
  metaPorRed,
  type MetasVistasPieza,
  type RedSocialMeta,
} from "@/lib/metricas/metas-vistas";
import { actualizarMetaVistas } from "./actions";

type MetasVistasEscaleraProps = {
  piezaId: string;
  metasIniciales: MetasVistasPieza;
  variant?: "standalone" | "embedded";
};

const iconosRed: Record<RedSocialMeta, LucideIcon> = {
  tiktok: Clapperboard,
  instagram: Aperture,
  facebook: Share2,
};

const nombresRed: Record<RedSocialMeta, string> = {
  tiktok: "TikTok",
  instagram: "Instagram",
  facebook: "Facebook",
};

const REDES: RedSocialMeta[] = ["tiktok", "instagram", "facebook"];

type EstiloRed = {
  color: string;
  capsuleBg: string;
  border: string;
  chipBg: string;
  chipText: string;
};

const estiloRed: Record<RedSocialMeta, EstiloRed> = {
  tiktok: {
    color: "#22d3ee",
    capsuleBg: "rgba(34,211,238,0.10)",
    border: "rgba(34,211,238,0.35)",
    chipBg: "rgba(34,211,238,0.15)",
    chipText: "#67e8f9",
  },
  instagram: {
    color: "#ec4899",
    capsuleBg: "rgba(236,72,153,0.10)",
    border: "rgba(236,72,153,0.35)",
    chipBg: "rgba(236,72,153,0.15)",
    chipText: "#f9a8d4",
  },
  facebook: {
    color: "#3b82f6",
    capsuleBg: "rgba(59,130,246,0.10)",
    border: "rgba(59,130,246,0.35)",
    chipBg: "rgba(59,130,246,0.15)",
    chipText: "#93c5fd",
  },
};

type MetaSelectRedProps = {
  red: RedSocialMeta;
  valorActual: number | null;
  guardandoRed: RedSocialMeta | null;
  compact?: boolean;
  onCambio: (red: RedSocialMeta, valor: number | null) => void;
};

function MetaSelectRed({
  red,
  valorActual,
  guardandoRed,
  compact = false,
  onCambio,
}: MetaSelectRedProps) {
  const Icono = iconosRed[red];
  const estilo = estiloRed[red];
  const guardando = guardandoRed === red;
  const bloqueado = guardandoRed !== null;

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const raw = e.target.value;
    if (raw === "") {
      onCambio(red, null);
      return;
    }
    onCambio(red, Number(raw));
  }

  return (
    <label
      className={`inline-flex min-w-0 items-center rounded-xl border ${
        compact ? "gap-1.5 px-2 py-1" : "gap-2 px-2.5 py-1.5"
      }`}
      style={{
        background: estilo.capsuleBg,
        borderColor: estilo.border,
      }}
    >
      <Icono
        className={`shrink-0 ${compact ? "h-3.5 w-3.5" : "h-3.5 w-3.5"}`}
        style={{ color: estilo.color }}
        aria-hidden
      />
      {!compact && (
        <span
          className="shrink-0 text-xs font-medium"
          style={{ color: estilo.color }}
        >
          {nombresRed[red]}
        </span>
      )}
      <span className="relative inline-flex items-center">
        <select
          value={valorActual ?? ""}
          onChange={handleChange}
          disabled={bloqueado}
          aria-label={`Meta de vistas en ${nombresRed[red]}`}
          className={`cursor-pointer appearance-none rounded-md border pr-6 text-[11px] font-semibold focus:outline-none focus:ring-1 disabled:cursor-wait disabled:opacity-50 ${
            compact
              ? "min-w-[3.25rem] max-w-[4.25rem] py-0.5 pl-1.5"
              : "min-w-[3.75rem] max-w-[5rem] py-1 pl-2"
          }`}
          style={{
            color: estilo.chipText,
            backgroundColor: estilo.chipBg,
            borderColor: estilo.border,
          }}
        >
          <option value="" style={{ backgroundColor: "#1a1f2e", color: "#cbd5e1" }}>—</option>
          {ESCALERA_METAS_VISTAS.map((meta) => (
            <option
              key={meta.valor}
              value={meta.valor}
              style={{ backgroundColor: "#1a1f2e", color: "#cbd5e1" }}
            >
              {meta.etiqueta}
            </option>
          ))}
        </select>
        {guardando ? (
          <Loader2
            className="pointer-events-none absolute right-1 h-3 w-3 animate-spin"
            style={{ color: estilo.color }}
            aria-hidden
          />
        ) : (
          <ChevronDown
            className="pointer-events-none absolute right-1 h-3 w-3 opacity-70"
            style={{ color: estilo.chipText }}
            aria-hidden
          />
        )}
      </span>
    </label>
  );
}

function MetasVistasSelectores({
  metas,
  guardandoRed,
  compact = false,
  onCambio,
}: {
  metas: MetasVistasPieza;
  guardandoRed: RedSocialMeta | null;
  compact?: boolean;
  onCambio: (red: RedSocialMeta, valor: number | null) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {REDES.map((red) => (
        <MetaSelectRed
          key={red}
          red={red}
          valorActual={metaPorRed(metas, red)}
          guardandoRed={guardandoRed}
          compact={compact}
          onCambio={onCambio}
        />
      ))}
    </div>
  );
}

export function MetasVistasEscalera({
  piezaId,
  metasIniciales,
  variant = "standalone",
}: MetasVistasEscaleraProps) {
  const router = useRouter();
  const [metas, setMetas] = useState(metasIniciales);
  const [guardandoRed, setGuardandoRed] = useState<RedSocialMeta | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMetas(metasIniciales);
  }, [metasIniciales]);

  async function handleCambio(red: RedSocialMeta, valor: number | null) {
    setError(null);
    setGuardandoRed(red);

    const columna = columnaPorRed(red);
    const snapshot = metas;
    setMetas((prev) => ({ ...prev, [columna]: valor }));

    const result = await actualizarMetaVistas(piezaId, red, valor);

    if (!result.ok) {
      setMetas(snapshot);
      setError(result.error);
      setGuardandoRed(null);
      return;
    }

    setGuardandoRed(null);
    router.refresh();
  }

  const selectores = (
    <MetasVistasSelectores
      metas={metas}
      guardandoRed={guardandoRed}
      compact={variant === "embedded"}
      onCambio={handleCambio}
    />
  );

  if (variant === "embedded") {
    return (
      <div className="shrink-0">
        {error && (
          <p className="mb-1.5 max-w-[16rem] text-right text-xs text-danger" role="alert">
            {error}
          </p>
        )}
        {selectores}
      </div>
    );
  }

  return (
    <section className="rounded-2xl border border-panel-border bg-[var(--surface-2)] p-6">
      <div className="mb-1 flex items-center gap-2">
        <TrendingUp className="h-[18px] w-[18px] text-accent" aria-hidden />
        <h2 className="text-[15px] font-semibold text-panel-text">
          Metas de vistas
        </h2>
      </div>
      <p className="mb-4 text-sm text-panel-text-muted">
        Elige la meta alcanzada en cada red. Usa &quot;Sin marcar&quot; para
        quitar la puntuación.
      </p>

      {error && (
        <p className="mb-3 text-sm text-danger" role="alert">
          {error}
        </p>
      )}

      {selectores}
    </section>
  );
}
