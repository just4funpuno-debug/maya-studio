"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Loader2, Trash2, X } from "lucide-react";
import { eliminarProductoAction } from "./actions";

type EliminarProductoDialogProps = {
  productoId: string;
  nombre: string;
};

const inputClass =
  "w-full rounded-[10px] border border-panel-border bg-panel-bg px-3 py-2.5 text-sm text-panel-text placeholder:text-panel-text-muted focus:border-danger/50 focus:outline-none focus:ring-1 focus:ring-danger/40";

export function EliminarProductoDialog({
  productoId,
  nombre,
}: EliminarProductoDialogProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [abierto, setAbierto] = useState(false);
  const [nombreEscrito, setNombreEscrito] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [eliminando, setEliminando] = useState(false);

  const nombreCoincide = nombreEscrito.trim() === nombre;

  useEffect(() => {
    if (!abierto) return;
    setNombreEscrito("");
    setError(null);
    const t = window.setTimeout(() => inputRef.current?.focus(), 50);
    return () => window.clearTimeout(t);
  }, [abierto]);

  useEffect(() => {
    if (!abierto) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && !eliminando) setAbierto(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [abierto, eliminando]);

  async function handleEliminar() {
    if (!nombreCoincide || eliminando) return;
    setError(null);
    setEliminando(true);

    const result = await eliminarProductoAction(productoId, nombreEscrito);

    if (!result.ok) {
      setError(result.error);
      setEliminando(false);
      return;
    }

    setAbierto(false);
    setEliminando(false);
    router.refresh();
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setAbierto(true)}
        title="Eliminar producto"
        aria-label={`Eliminar producto ${nombre}`}
        className="shrink-0 rounded-[9px] border border-transparent p-2 text-panel-text-muted transition-colors hover:border-danger/40 hover:bg-danger/10 hover:text-danger"
      >
        <Trash2 className="h-4 w-4" aria-hidden />
      </button>

      {abierto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="presentation"
        >
          <button
            type="button"
            aria-label="Cerrar"
            className="absolute inset-0 bg-black/60"
            onClick={() => !eliminando && setAbierto(false)}
          />

          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="eliminar-producto-titulo"
            className="relative z-10 w-full max-w-md rounded-2xl border border-panel-border bg-[var(--surface-2)] p-6 shadow-xl"
          >
            <button
              type="button"
              onClick={() => !eliminando && setAbierto(false)}
              disabled={eliminando}
              className="absolute right-4 top-4 rounded-md p-1 text-panel-text-muted transition-colors hover:text-panel-text disabled:opacity-50"
              aria-label="Cerrar"
            >
              <X className="h-4 w-4" aria-hidden />
            </button>

            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-danger/15">
              <AlertTriangle className="h-5 w-5 text-danger" aria-hidden />
            </div>

            <h2
              id="eliminar-producto-titulo"
              className="pr-8 text-lg font-semibold text-panel-text"
            >
              Eliminar producto
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-panel-text-muted">
              Vas a borrar <span className="font-medium text-panel-text">{nombre}</span>{" "}
              y todo lo asociado de forma permanente:
            </p>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-panel-text-muted">
              <li>Fotos de trabajo y foto de perfil</li>
              <li>Actores de este producto</li>
              <li>Configuración (tipos, motor, fotos)</li>
              <li>Historial de piezas aprobadas</li>
              <li>Asignaciones a creadores</li>
            </ul>
            <p className="mt-3 text-sm font-medium text-danger">
              Esta acción no se puede deshacer.
            </p>

            <div className="mt-5 space-y-1.5">
              <label
                htmlFor={`confirmar-nombre-${productoId}`}
                className="block text-xs font-medium text-panel-text-muted"
              >
                Escribe el nombre exacto del producto para confirmar
              </label>
              <input
                ref={inputRef}
                id={`confirmar-nombre-${productoId}`}
                type="text"
                value={nombreEscrito}
                onChange={(e) => setNombreEscrito(e.target.value)}
                disabled={eliminando}
                placeholder={nombre}
                autoComplete="off"
                className={inputClass}
              />
            </div>

            {error && (
              <p className="mt-3 text-sm text-danger" role="alert">
                {error}
              </p>
            )}

            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setAbierto(false)}
                disabled={eliminando}
                className="rounded-xl border border-panel-border px-4 py-2.5 text-sm font-medium text-panel-text transition-colors hover:border-[var(--border-strong)] disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleEliminar}
                disabled={!nombreCoincide || eliminando}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-danger px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {eliminando ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                    Eliminando…
                  </>
                ) : (
                  "Eliminar definitivamente"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
