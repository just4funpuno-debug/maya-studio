"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ImageIcon, Loader2, Package, Trash2, Upload } from "lucide-react";
import {
  eliminarFotoPerfilAction,
  subirFotoPerfilAction,
} from "./actions";

type FotoPerfilSectionProps = {
  productoId: string;
  fotoPerfilUrl: string | null;
};

export function FotoPerfilSection({
  productoId,
  fotoPerfilUrl: fotoInicial,
}: FotoPerfilSectionProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [fotoPerfilUrl, setFotoPerfilUrl] = useState(fotoInicial);
  const [error, setError] = useState<string | null>(null);
  const [subiendo, setSubiendo] = useState(false);
  const [eliminando, setEliminando] = useState(false);

  useEffect(() => {
    setFotoPerfilUrl(fotoInicial);
  }, [fotoInicial]);

  async function handleArchivoSeleccionado(e: React.ChangeEvent<HTMLInputElement>) {
    const archivo = e.target.files?.[0];
    if (!archivo) return;

    setError(null);
    setSubiendo(true);

    const formData = new FormData();
    formData.set("imagen", archivo);

    const result = await subirFotoPerfilAction(productoId, formData);

    if (!result.ok) {
      setError(result.error);
      setSubiendo(false);
      e.target.value = "";
      return;
    }

    setSubiendo(false);
    e.target.value = "";
    router.refresh();
  }

  async function handleEliminar() {
    const confirmar = window.confirm(
      "¿Eliminar la foto de perfil? El panel volverá a mostrar la foto de caja como miniatura."
    );
    if (!confirmar) return;

    setError(null);
    setEliminando(true);

    const result = await eliminarFotoPerfilAction(productoId);

    if (!result.ok) {
      setError(result.error);
      setEliminando(false);
      return;
    }

    setFotoPerfilUrl(null);
    setEliminando(false);
    router.refresh();
  }

  function abrirSelector() {
    if (!subiendo && !eliminando) {
      inputRef.current?.click();
    }
  }

  return (
    <section className="rounded-xl border border-panel-border bg-[var(--surface-2)] p-5">
      <div className="flex items-center gap-3">
        {/* Miniatura */}
        <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-panel-border bg-panel-bg">
          {fotoPerfilUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={fotoPerfilUrl}
              alt="Foto de perfil del producto"
              className="h-full w-full object-cover"
            />
          ) : (
            <Package className="h-6 w-6 text-panel-text-muted" aria-hidden />
          )}
        </div>

        {/* Info + acciones */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <ImageIcon className="h-4 w-4 text-accent" aria-hidden />
            <h2 className="text-sm font-semibold text-panel-text">
              Foto de perfil
            </h2>
          </div>
          <p className="mt-0.5 text-[11px] text-panel-text-muted">
            Solo para el panel. No se usa para generar contenido.
          </p>
        </div>

        {/* Botones */}
        <div className="flex shrink-0 items-center gap-2">
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="sr-only"
            disabled={subiendo || eliminando}
            onChange={handleArchivoSeleccionado}
          />
          <button
            type="button"
            onClick={abrirSelector}
            disabled={subiendo || eliminando}
            className="flex items-center gap-1.5 rounded-lg bg-accent px-3 py-2 text-xs font-semibold text-panel-sidebar transition-colors hover:bg-accent-strong disabled:opacity-60"
          >
            {subiendo ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
                Subiendo…
              </>
            ) : (
              <>
                <Upload className="h-3.5 w-3.5" aria-hidden />
                {fotoPerfilUrl ? "Cambiar" : "Subir"}
              </>
            )}
          </button>

          {fotoPerfilUrl && (
            <button
              type="button"
              onClick={handleEliminar}
              disabled={subiendo || eliminando}
              className="flex items-center gap-1 rounded-lg border border-panel-border px-2.5 py-2 text-xs text-panel-text-muted transition-colors hover:border-danger/50 hover:text-danger disabled:opacity-50"
            >
              {eliminando ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
              ) : (
                <Trash2 className="h-3.5 w-3.5" aria-hidden />
              )}
            </button>
          )}
        </div>
      </div>

      {error && (
        <p className="mt-3 text-xs text-danger" role="alert">
          {error}
        </p>
      )}
    </section>
  );
}
