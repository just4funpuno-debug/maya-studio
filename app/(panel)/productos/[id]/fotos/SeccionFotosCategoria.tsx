"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus, Star, Trash2 } from "lucide-react";
import { CategoriaFoto, ETIQUETAS_CATEGORIA } from "@/lib/storage/productos";
import { agregarFoto, eliminarFoto, marcarComoPrincipal } from "./actions";

export type FotoProducto = {
  id: string;
  imagen_url: string;
  creado_en: string;
  es_principal: boolean;
};

type SeccionFotosCategoriaProps = {
  productoId: string;
  categoria: CategoriaFoto;
  fotos: FotoProducto[];
};

function aplicarNuevaPrincipal(
  fotos: FotoProducto[],
  fotoId: string
): FotoProducto[] {
  return fotos.map((f) => ({ ...f, es_principal: f.id === fotoId }));
}

export function SeccionFotosCategoria({
  productoId,
  categoria,
  fotos,
}: SeccionFotosCategoriaProps) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [fotosLocales, setFotosLocales] = useState(fotos);
  const [error, setError] = useState<string | null>(null);
  const [subiendo, setSubiendo] = useState(false);
  const [eliminando, setEliminando] = useState<string | null>(null);
  const [marcandoPrincipal, setMarcandoPrincipal] = useState<string | null>(null);

  useEffect(() => {
    setFotosLocales(fotos);
  }, [fotos]);

  const etiqueta = ETIQUETAS_CATEGORIA[categoria];

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubiendo(true);

    const formData = new FormData(e.currentTarget);
    const result = await agregarFoto(productoId, categoria, formData);

    if (!result.ok) {
      setError(result.error);
      setSubiendo(false);
      return;
    }

    setFotosLocales((prev) => [result.foto, ...prev]);
    formRef.current?.reset();
    setSubiendo(false);
    router.refresh();
  }

  async function handleMarcarPrincipal(fotoId: string) {
    const foto = fotosLocales.find((f) => f.id === fotoId);
    if (!foto || foto.es_principal) return;

    setError(null);
    setMarcandoPrincipal(fotoId);
    setFotosLocales((prev) => aplicarNuevaPrincipal(prev, fotoId));

    const result = await marcarComoPrincipal(fotoId, productoId);

    if (!result.ok) {
      setFotosLocales(fotos);
      setError(result.error);
    }

    setMarcandoPrincipal(null);
    router.refresh();
  }

  async function handleEliminar(fotoId: string) {
    const confirmar = window.confirm(
      `¿Eliminar esta foto de ${etiqueta}? Esta acción no se puede deshacer.`
    );
    if (!confirmar) return;

    setError(null);
    setEliminando(fotoId);

    const result = await eliminarFoto(fotoId, productoId);

    if (!result.ok) {
      setError(result.error);
      setEliminando(null);
      return;
    }

    setFotosLocales((prev) => {
      const restantes = prev.filter((f) => f.id !== fotoId);
      if (result.nuevaPrincipalId) {
        return aplicarNuevaPrincipal(restantes, result.nuevaPrincipalId);
      }
      return restantes;
    });
    setEliminando(null);
    router.refresh();
  }

  return (
    <section className="space-y-4 rounded-xl border border-panel-border bg-[var(--surface-2)] p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="h-4 w-1 rounded-full bg-accent" aria-hidden />
          <h3 className="text-sm font-semibold text-panel-text">{etiqueta}</h3>
          <span className="text-xs text-panel-text-muted">
            ({fotosLocales.length})
          </span>
        </div>
      </div>

      {error && (
        <p className="text-xs text-danger" role="alert">
          {error}
        </p>
      )}

      {fotosLocales.length === 0 ? (
        <p className="rounded-lg border border-dashed border-panel-border px-4 py-5 text-center text-xs text-panel-text-muted">
          Aún no hay fotos de {etiqueta.toLowerCase()}.
        </p>
      ) : (
        <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {fotosLocales.map((foto) => (
            <li
              key={foto.id}
              className={`group relative overflow-hidden rounded-lg border bg-panel-bg ${
                foto.es_principal
                  ? "border-2 border-accent ring-1 ring-accent/30"
                  : "border-panel-border"
              }`}
            >
              <div className="aspect-square">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={foto.imagen_url}
                  alt={`Foto ${etiqueta}${foto.es_principal ? " (principal)" : ""}`}
                  className="h-full w-full object-cover"
                />
              </div>

              {/* Badge principal */}
              {foto.es_principal && (
                <span className="absolute left-1 top-1 flex items-center gap-0.5 rounded bg-accent px-1.5 py-0.5 text-[9px] font-medium text-panel-sidebar">
                  <Star className="h-2.5 w-2.5 fill-current" aria-hidden />
                  Principal
                </span>
              )}

              {/* Overlay de acciones en hover */}
              <div className="absolute inset-0 flex items-end justify-center gap-1 bg-black/50 p-1.5 opacity-0 transition-opacity group-hover:opacity-100">
                {!foto.es_principal && (
                  <button
                    type="button"
                    onClick={() => handleMarcarPrincipal(foto.id)}
                    disabled={marcandoPrincipal === foto.id}
                    title="Hacer principal"
                    className="flex h-6 w-6 items-center justify-center rounded bg-panel-sidebar/90 text-panel-text-muted transition-colors hover:text-accent disabled:opacity-50"
                  >
                    <Star className="h-3 w-3" aria-hidden />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleEliminar(foto.id)}
                  disabled={eliminando === foto.id}
                  title="Eliminar"
                  className="flex h-6 w-6 items-center justify-center rounded bg-panel-sidebar/90 text-panel-text-muted transition-colors hover:text-danger disabled:opacity-50"
                >
                  <Trash2 className="h-3 w-3" aria-hidden />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Formulario compacto para subir */}
      <form ref={formRef} onSubmit={handleSubmit} className="flex flex-wrap items-center gap-3 border-t border-panel-border pt-3">
        <input
          id={`imagen-${categoria}`}
          name="imagen"
          type="file"
          required
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="min-w-0 flex-1 text-xs text-panel-text-muted file:mr-2 file:rounded-md file:border-0 file:bg-accent-muted file:px-2.5 file:py-1 file:text-xs file:font-medium file:text-accent hover:file:bg-accent/20"
        />
        <button
          type="submit"
          disabled={subiendo}
          className="flex items-center gap-1.5 rounded-lg bg-accent px-3 py-1.5 text-xs font-medium text-panel-sidebar transition-colors hover:bg-accent-strong disabled:opacity-50"
        >
          <ImagePlus className="h-3.5 w-3.5" aria-hidden />
          {subiendo ? "Subiendo..." : "Subir"}
        </button>
      </form>
    </section>
  );
}
