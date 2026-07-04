"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Check, Cpu, Loader2 } from "lucide-react";
import { actualizarModeloIa } from "./actions";
import { MODELOS_IA } from "@/lib/motor/modelos";

type ModeloIaSelectorProps = {
  productoId: string;
  modeloActual: string;
};

/* Color del chip de precio según orden (barato→caro) */
const COLORES_PRECIO = ["#22c55e", "#38bdf8", "#a78bfa", "#f59e0b"];

export function ModeloIaSelector({
  productoId,
  modeloActual,
}: ModeloIaSelectorProps) {
  const router = useRouter();
  const [seleccion, setSeleccion] = useState(modeloActual);
  const [guardando, setGuardando] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function elegir(modeloId: string) {
    if (modeloId === seleccion || guardando) return;
    setError(null);
    setGuardando(modeloId);
    const result = await actualizarModeloIa(productoId, modeloId);
    if (!result.ok) {
      setError(result.error);
      setGuardando(null);
      return;
    }
    setSeleccion(modeloId);
    setGuardando(null);
    router.refresh();
  }

  return (
    <section className="rounded-2xl border border-panel-border bg-[var(--surface-2)] p-6">
      <div className="mb-1 flex items-center gap-2">
        <Cpu className="h-[18px] w-[18px] text-accent" aria-hidden />
        <h2 className="text-[15px] font-semibold text-panel-text">
          Modelo de IA
        </h2>
      </div>
      <p className="mb-5 text-sm text-panel-text-muted">
        Elige qué modelo de Anthropic genera las piezas de este producto.
      </p>

      {error && (
        <p className="mb-3 text-sm text-danger" role="alert">
          {error}
        </p>
      )}

      <div className="space-y-3">
        {MODELOS_IA.map((m, i) => {
          const activo = seleccion === m.id;
          const cargando = guardando === m.id;
          const colorPrecio = COLORES_PRECIO[i % COLORES_PRECIO.length];
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => elegir(m.id)}
              disabled={!!guardando}
              aria-pressed={activo}
              className={`flex w-full items-start gap-3 rounded-2xl border p-4 text-left transition-all duration-150 disabled:cursor-wait ${
                activo
                  ? "border-accent bg-accent-muted"
                  : "border-panel-border bg-panel-surface hover:border-[var(--border-strong)]"
              }`}
            >
              <span
                className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full transition-colors ${
                  activo
                    ? "bg-accent text-panel-sidebar"
                    : "border-2 border-[var(--border-strong)]"
                }`}
                aria-hidden
              >
                {cargando ? (
                  <Loader2 className="h-3 w-3 animate-spin text-accent" />
                ) : activo ? (
                  <Check className="h-3 w-3" strokeWidth={3} />
                ) : null}
              </span>
              <span className="flex-1">
                <span className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium text-panel-text">
                    {m.nombre}
                  </span>
                  <span
                    className="rounded-md bg-[var(--surface-3)] px-2 py-0.5 text-xs font-semibold"
                    style={{ color: colorPrecio }}
                  >
                    {m.precioEstimadoPieza}
                  </span>
                  {activo && (
                    <span className="rounded bg-accent px-2 py-0.5 text-[11px] font-semibold text-panel-sidebar">
                      Activo
                    </span>
                  )}
                </span>
                {m.descripcion && (
                  <span className="mt-1 block text-xs text-panel-text-muted">
                    {m.descripcion}
                  </span>
                )}
                <span className="mt-1 block font-mono text-[11px] text-panel-text-muted/70">
                  {m.id}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <p className="mt-4 text-[11px] leading-relaxed text-panel-text-muted/70">
        El precio por pieza es una estimación (~18k tokens de entrada y ~3k de
        salida). El costo real varía según el historial y el tamaño del prompt
        maestro.
      </p>
    </section>
  );
}
