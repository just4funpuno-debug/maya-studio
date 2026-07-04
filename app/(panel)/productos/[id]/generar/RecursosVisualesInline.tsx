"use client";

import Link from "next/link";
import { Star, User } from "lucide-react";
import { useLightbox } from "./ImagenLightbox";
import {
  buscarActorPorNombre,
  categoriasDesdeReferenciaProducto,
  type ContextoFotosProducto,
  type RecursosGeneracion,
} from "@/lib/motor/fotos-contexto";
import { CategoriaFoto, ETIQUETAS_CATEGORIA } from "@/lib/storage/productos";

type RecursosBaseProps = {
  productoId: string;
  ctx: ContextoFotosProducto;
};

function str(val: unknown): string | null {
  return typeof val === "string" && val.trim() ? val.trim() : null;
}

function etiquetaCategoria(categoria: CategoriaFoto): string {
  return ETIQUETAS_CATEGORIA[categoria];
}

export function MiniaturaFotoCategoria({
  categoria,
  imagenUrl,
  compacto = false,
}: {
  categoria: CategoriaFoto;
  imagenUrl: string;
  compacto?: boolean;
}) {
  const { abrir } = useLightbox();
  const sizeClass = compacto ? "w-28" : "w-36";
  const etiqueta = etiquetaCategoria(categoria);
  const titulo = `${etiqueta} · Principal`;

  return (
    <div className={`flex shrink-0 flex-col gap-1.5 ${sizeClass}`}>
      <button
        type="button"
        onClick={() =>
          abrir({
            imagenUrl,
            titulo,
            nombreArchivo: `${categoria}-principal`,
          })
        }
        aria-label={`Ampliar foto de ${etiqueta}`}
        className="group relative aspect-square overflow-hidden rounded-lg border-2 border-accent ring-1 ring-accent/30 transition-shadow hover:ring-accent/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imagenUrl}
          alt={`Foto principal de ${etiqueta}`}
          className="h-full w-full object-cover transition-opacity group-hover:opacity-90"
        />
        <span className="pointer-events-none absolute left-1 top-1 flex items-center gap-0.5 rounded bg-accent px-1.5 py-0.5 text-[10px] font-medium text-panel-sidebar">
          <Star className="h-2.5 w-2.5 fill-current" aria-hidden />
          Principal
        </span>
      </button>
      <p className="text-center text-xs font-medium text-panel-text">{titulo}</p>
    </div>
  );
}

export function AvisoFotoFaltante({
  categoria,
  productoId,
  compacto = false,
}: {
  categoria: CategoriaFoto;
  productoId: string;
  compacto?: boolean;
}) {
  return (
    <div
      className={`flex shrink-0 flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed border-accent/50 bg-accent-muted/50 text-center ${
        compacto ? "w-28 px-2 py-3" : "w-36 px-3 py-4"
      }`}
    >
      <p className="text-xs text-accent">
        ⚠️ Falta subir foto de {etiquetaCategoria(categoria)}
      </p>
      <Link
        href={`/productos/${productoId}/fotos`}
        className="text-[10px] font-medium text-accent underline hover:text-accent-strong"
      >
        Ir a Fotos →
      </Link>
    </div>
  );
}

export function MiniaturasPorCategorias({
  categorias,
  productoId,
  ctx,
  compacto = false,
}: RecursosBaseProps & {
  categorias: CategoriaFoto[];
  compacto?: boolean;
}) {
  if (categorias.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-3 pt-2">
      {categorias.map((cat) => {
        const url = ctx.fotosPrincipales[cat];
        if (url) {
          return (
            <MiniaturaFotoCategoria
              key={cat}
              categoria={cat}
              imagenUrl={url}
              compacto={compacto}
            />
          );
        }
        return (
          <AvisoFotoFaltante
            key={cat}
            categoria={cat}
            productoId={productoId}
            compacto={compacto}
          />
        );
      })}
    </div>
  );
}

export function BloqueReferenciaProducto({
  titulo,
  ref,
  categorias,
  productoId,
  ctx,
}: RecursosBaseProps & {
  titulo: string;
  ref?: Record<string, unknown>;
  categorias?: CategoriaFoto[];
}) {
  const cats =
    categorias ??
    (ref ? categoriasDesdeReferenciaProducto(ref, ctx) : []);

  if (cats.length === 0 && !ref) return null;

  return (
    <div className="rounded-md border border-accent/40 bg-accent-muted p-3 space-y-2 text-sm">
      <p className="font-medium text-accent">{titulo}</p>
      {ref && str(ref.tipo) && (
        <p className="text-panel-text">
          Tipo: {str(ref.tipo)}
          {str(ref.categoria) && (
            <>
              {" "}
              · Categoría:{" "}
              {ETIQUETAS_CATEGORIA[str(ref.categoria) as CategoriaFoto] ??
                str(ref.categoria)}
            </>
          )}
        </p>
      )}
      {ref && str(ref.como_se_ve) && (
        <div>
          <p className="text-xs font-medium text-panel-text-muted">Cómo se ve</p>
          <p className="mt-0.5 text-sm text-panel-text">{str(ref.como_se_ve)}</p>
        </div>
      )}
      {ref && str(ref.foto) && (
        <div>
          <p className="text-xs font-medium text-panel-text-muted">Foto sugerida</p>
          <p className="mt-0.5 text-sm text-panel-text">{str(ref.foto)}</p>
        </div>
      )}
      <MiniaturasPorCategorias
        categorias={cats}
        productoId={productoId}
        ctx={ctx}
        compacto
      />
    </div>
  );
}

export function BloqueActorSugerido({
  actorNombre,
  tipoActor,
  productoId,
  recursos,
}: {
  actorNombre: string;
  tipoActor?: string | null;
  productoId: string;
  recursos: RecursosGeneracion;
}) {
  const { abrir } = useLightbox();
  const actor = buscarActorPorNombre(actorNombre, recursos.actores);
  const nombreMostrar = actor?.nombre ?? actorNombre;

  return (
    <div className="rounded-md border border-accent/40 bg-accent-muted p-3 space-y-2 text-sm">
      <p className="font-medium text-accent">Actor sugerido</p>
      {actor?.imagen_url ? (
        <div className="flex items-start gap-3 pt-1">
          <button
            type="button"
            onClick={() =>
              abrir({
                imagenUrl: actor.imagen_url!,
                titulo: nombreMostrar,
                nombreArchivo: `actor-${nombreMostrar}`,
              })
            }
            aria-label={`Ampliar foto de ${nombreMostrar}`}
            className="relative h-28 w-28 shrink-0 overflow-hidden rounded-lg border border-panel-border bg-panel-bg transition-shadow hover:ring-2 hover:ring-accent/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={actor.imagen_url}
              alt={nombreMostrar}
              className="h-full w-full object-cover"
            />
          </button>
          <div className="min-w-0 space-y-1">
            <p className="font-medium text-panel-text">{nombreMostrar}</p>
            {tipoActor && (
              <p className="text-xs text-panel-text-muted">Tipo: {tipoActor}</p>
            )}
            {actor.perfil && (
              <p className="text-xs text-panel-text-muted">{actor.perfil}</p>
            )}
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3 pt-1">
          <User className="h-10 w-10 shrink-0 text-panel-text-muted" aria-hidden />
          <div>
            <p className="font-medium text-panel-text">{actorNombre}</p>
            {tipoActor && (
              <p className="text-xs text-panel-text-muted">Tipo: {tipoActor}</p>
            )}
            <p className="text-xs text-panel-text-muted">
              No está en el banco —{" "}
              <Link
                href={`/productos/${productoId}/actores`}
                className="text-accent underline hover:text-accent-strong"
              >
                agregar actor
              </Link>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
