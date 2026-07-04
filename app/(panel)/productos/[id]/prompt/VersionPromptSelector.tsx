"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Check, FileText, Loader2, Lock } from "lucide-react";
import type { PromptMaestroListado } from "@/lib/prompts/prompts-maestros";
import { actualizarVersionPrompt } from "./actions";

type VersionPromptSelectorProps = {
  productoId: string;
  versionActual: string;
  prompts: PromptMaestroListado[];
};

export function VersionPromptSelector({
  productoId,
  versionActual,
  prompts,
}: VersionPromptSelectorProps) {
  const router = useRouter();
  const [seleccion, setSeleccion] = useState(versionActual);
  const [guardando, setGuardando] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setSeleccion(versionActual);
  }, [versionActual]);

  async function elegir(version: string) {
    if (version === seleccion || guardando) return;
    setError(null);
    setGuardando(version);
    const result = await actualizarVersionPrompt(productoId, version);
    if (!result.ok) {
      setError(result.error);
      setGuardando(null);
      return;
    }
    setSeleccion(version);
    setGuardando(null);
    router.refresh();
  }

  return (
    <section className="rounded-2xl border border-panel-border bg-[var(--surface-2)] p-6">
      <div className="mb-1 flex items-center gap-2">
        <FileText className="h-[18px] w-[18px] text-accent" aria-hidden />
        <h2 className="text-[15px] font-semibold text-panel-text">
          Versión del prompt
        </h2>
      </div>
      <p className="mb-5 text-sm text-panel-text-muted">
        El motor usará la versión que elijas al crear cada pieza.
      </p>

      {error && (
        <p className="mb-3 text-sm text-danger" role="alert">
          {error}
        </p>
      )}

      <div className="space-y-3">
        {prompts.map((v) => {
          const activa = seleccion === v.id;
          const cargando = guardando === v.id;
          const esSistema = !v.es_editable;
          return (
            <button
              key={v.id}
              type="button"
              onClick={() => elegir(v.id)}
              disabled={!!guardando}
              aria-pressed={activa}
              className={`flex w-full items-start gap-3 rounded-2xl border p-4 text-left transition-all duration-150 disabled:cursor-wait ${
                activa
                  ? "border-accent bg-accent-muted"
                  : "border-panel-border bg-panel-surface hover:border-[var(--border-strong)]"
              }`}
            >
              <span
                className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full transition-colors ${
                  activa
                    ? "bg-accent text-panel-sidebar"
                    : "border-2 border-[var(--border-strong)]"
                }`}
                aria-hidden
              >
                {cargando ? (
                  <Loader2 className="h-3 w-3 animate-spin text-accent" />
                ) : activa ? (
                  <Check className="h-3 w-3" strokeWidth={3} />
                ) : null}
              </span>
              <span className="flex-1">
                <span className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium text-panel-text">
                    {v.nombre}
                  </span>
                  <span className="rounded bg-[var(--surface-3)] px-1.5 py-0.5 text-[11px] text-panel-text-muted">
                    {v.id}
                  </span>
                  {esSistema && (
                    <span className="inline-flex items-center gap-0.5 rounded bg-[var(--surface-3)] px-1.5 py-0.5 text-[11px] text-panel-text-muted">
                      <Lock className="h-2.5 w-2.5" aria-hidden />
                      Sistema
                    </span>
                  )}
                  {activa && (
                    <span className="rounded bg-accent px-2 py-0.5 text-[11px] font-semibold text-panel-sidebar">
                      Activa
                    </span>
                  )}
                </span>
                {v.descripcion && (
                  <span className="mt-1 block text-xs text-panel-text-muted">
                    {v.descripcion}
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
