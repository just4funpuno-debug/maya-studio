"use client";

import { useState } from "react";
import {
  CATEGORIAS_FOTO,
  CategoriaFoto,
  ETIQUETAS_CATEGORIA,
} from "@/lib/storage/productos";
import { actualizarCategoriaFotoActiva } from "./actions";

type ConfigFotosTogglesProps = {
  productoId: string;
  activoPorCategoria: Record<CategoriaFoto, boolean>;
  onToggle?: (categoria: CategoriaFoto, activo: boolean) => void;
};

export function ConfigFotosToggles({
  productoId,
  activoPorCategoria,
  onToggle,
}: ConfigFotosTogglesProps) {
  const [estado, setEstado] = useState(activoPorCategoria);
  const [guardando, setGuardando] = useState<CategoriaFoto | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleToggle(categoria: CategoriaFoto, nuevoActivo: boolean) {
    const anterior = estado[categoria];
    setError(null);
    setEstado((prev) => ({ ...prev, [categoria]: nuevoActivo }));
    onToggle?.(categoria, nuevoActivo);
    setGuardando(categoria);

    const result = await actualizarCategoriaFotoActiva(
      productoId,
      categoria,
      nuevoActivo
    );

    if (!result.ok) {
      setEstado((prev) => ({ ...prev, [categoria]: anterior }));
      onToggle?.(categoria, anterior);
      setError(result.error);
    }

    setGuardando(null);
  }

  const totalActivas = CATEGORIAS_FOTO.filter((c) => estado[c]).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-panel-text-muted">
          Activa solo las categorías que apliquen a este producto.
        </p>
        <div className="text-right">
          <p className="text-xl font-semibold text-accent">
            {totalActivas}
            <span className="text-sm text-panel-text-muted">/{CATEGORIAS_FOTO.length}</span>
          </p>
          <p className="text-[11px] text-panel-text-muted">categorías activas</p>
        </div>
      </div>

      {error && (
        <p className="text-sm text-danger" role="alert">
          {error}
        </p>
      )}

      <ul className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
        {CATEGORIAS_FOTO.map((categoria) => {
          const activo = estado[categoria];
          const etiqueta = ETIQUETAS_CATEGORIA[categoria];
          const cargando = guardando === categoria;

          return (
            <li
              key={categoria}
              className={`rounded-xl border p-3.5 transition-colors ${
                activo
                  ? "border-accent/40 bg-accent/[0.06]"
                  : "border-panel-border bg-panel-surface"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <p className="font-medium text-panel-text">{etiqueta}</p>

                <button
                  type="button"
                  role="switch"
                  aria-checked={activo}
                  aria-label={`${activo ? "Desactivar" : "Activar"} ${etiqueta}`}
                  disabled={cargando}
                  onClick={() => handleToggle(categoria, !activo)}
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
                    ● Activa
                  </span>
                ) : (
                  <span className="text-[10px] uppercase tracking-wide text-panel-text-muted">
                    Inactiva
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
