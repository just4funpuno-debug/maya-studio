"use client";

import { useState } from "react";
import { actualizarTipoActivo } from "./actions";

export type TipoContenido = {
  id: string;
  nombre: string;
  descripcion: string | null;
  tipo_salida: string | null;
};

type TiposToggleListProps = {
  productoId: string;
  tipos: TipoContenido[];
  activosPorTipoId: Record<string, boolean>;
};

const badgeStyles: Record<string, string> = {
  prompts: "bg-blue-500/20 text-blue-300",
  guion: "bg-violet-500/20 text-violet-300",
  carrusel: "bg-green-500/20 text-green-300",
};

export function TiposToggleList({
  productoId,
  tipos,
  activosPorTipoId,
}: TiposToggleListProps) {
  const [estado, setEstado] = useState<Record<string, boolean>>(activosPorTipoId);
  const [guardando, setGuardando] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleToggle(tipoId: string, nuevoActivo: boolean) {
    const anterior = estado[tipoId] ?? false;
    setError(null);
    setEstado((prev) => ({ ...prev, [tipoId]: nuevoActivo }));
    setGuardando(tipoId);

    const result = await actualizarTipoActivo(productoId, tipoId, nuevoActivo);

    if (!result.ok) {
      setEstado((prev) => ({ ...prev, [tipoId]: anterior }));
      setError(result.error);
    }
    setGuardando(null);
  }

  const totalActivos = tipos.filter((tipo) => estado[tipo.id] ?? false).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-panel-text-muted">
          Activa los tipos de contenido que quieres generar para este producto.
        </p>
        <div className="text-right">
          <p className="text-xl font-semibold text-accent">
            {totalActivos}
            <span className="text-sm text-panel-text-muted">/{tipos.length}</span>
          </p>
          <p className="text-[11px] text-panel-text-muted">tipos activos</p>
        </div>
      </div>

      {error && (
        <p className="text-sm text-danger" role="alert">
          {error}
        </p>
      )}

      <ul className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        {tipos.map((tipo) => {
          const activo = estado[tipo.id] ?? false;
          const salida = tipo.tipo_salida ?? "—";
          const badgeClass =
            badgeStyles[salida] ?? "bg-panel-surface-hover text-panel-text-muted";
          const cargando = guardando === tipo.id;

          return (
            <li
              key={tipo.id}
              className={`rounded-xl border p-3.5 transition-colors ${
                activo
                  ? "border-accent/40 bg-accent/[0.06]"
                  : "border-panel-border bg-panel-surface"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-panel-text">{tipo.nombre}</p>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${badgeClass}`}
                    >
                      {salida}
                    </span>
                  </div>
                  {tipo.descripcion && (
                    <p className="mt-1 text-sm text-panel-text-muted">
                      {tipo.descripcion}
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  role="switch"
                  aria-checked={activo}
                  aria-label={`${activo ? "Desactivar" : "Activar"} ${tipo.nombre}`}
                  disabled={cargando}
                  onClick={() => handleToggle(tipo.id, !activo)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-50 ${
                    activo ? "bg-accent" : "bg-panel-border"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                      activo ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              <div className="mt-2">
                {activo ? (
                  <span className="text-[10px] font-medium uppercase tracking-wide text-accent">
                    ● Activo
                  </span>
                ) : (
                  <span className="text-[10px] uppercase tracking-wide text-panel-text-muted">
                    Inactivo
                  </span>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
