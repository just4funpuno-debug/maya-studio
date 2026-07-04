"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Copy, Check, ImagePlus, Users } from "lucide-react";
import { eliminarActor, subirFotoActor } from "./actions";

type Actor = {
  id: string;
  nombre: string | null;
  perfil: string | null;
  imagen_url: string | null;
  identidad: Record<string, unknown> | null;
  descripcion_fisica: Record<string, unknown> | null;
  prompt_carrusel: string | null;
  notas: string | null;
};

type Props = {
  productoId: string;
  actores: Actor[];
};

const generoBadge: Record<string, string> = {
  mujer: "bg-pink-500/15 text-pink-300",
  hombre: "bg-blue-500/15 text-blue-300",
};

export function BancoActores({ productoId, actores }: Props) {
  const router = useRouter();
  const [eliminando, setEliminando] = useState<string | null>(null);
  const [subiendoFoto, setSubiendoFoto] = useState<string | null>(null);
  const [copiado, setCopiado] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputs = useRef<Record<string, HTMLInputElement | null>>({});

  async function handleEliminar(actorId: string, nombre: string) {
    if (!window.confirm(`¿Eliminar a "${nombre}"? No se puede deshacer.`)) return;
    setError(null);
    setEliminando(actorId);
    const result = await eliminarActor(actorId, productoId);
    if (!result.ok) setError(result.error);
    setEliminando(null);
  }

  async function handleSubirFoto(actorId: string, e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setSubiendoFoto(actorId);
    const formData = new FormData();
    formData.append("imagen", file);
    const result = await subirFotoActor(actorId, productoId, formData);
    if (!result.ok) setError(result.error);
    else router.refresh();
    setSubiendoFoto(null);
    if (fileInputs.current[actorId]) fileInputs.current[actorId]!.value = "";
  }

  async function handleCopiar(actorId: string, texto: string) {
    try {
      await navigator.clipboard.writeText(texto);
      setCopiado(actorId);
      setTimeout(() => setCopiado((p) => (p === actorId ? null : p)), 2000);
    } catch {
      setError("No se pudo copiar.");
    }
  }

  if (actores.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-panel-border px-4 py-8 text-center text-panel-text-muted">
        Sin actores aún. Genera el primero con el taller de arriba.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {error && (
        <p className="text-sm text-danger" role="alert">{error}</p>
      )}
      <div className="overflow-hidden rounded-xl border border-panel-border">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-panel-border bg-[var(--surface-2)]">
            <tr>
              <th className="px-3 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-panel-text-muted">Foto</th>
              <th className="px-3 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-panel-text-muted">Nombre</th>
              <th className="hidden px-3 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-panel-text-muted sm:table-cell">Género·Edad</th>
              <th className="hidden px-3 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-panel-text-muted md:table-cell">Ocupación</th>
              <th className="px-3 py-2.5 text-right text-[11px] font-semibold uppercase tracking-wide text-panel-text-muted">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-panel-border">
            {actores.map((actor) => {
              const id = actor.identidad as Record<string, unknown> | null;
              const genero = (id?.genero as string)?.toLowerCase() ?? "";
              const badge = generoBadge[genero] ?? "bg-panel-surface-hover text-panel-text-muted";

              return (
                <tr key={actor.id} className="bg-panel-surface transition-colors hover:bg-panel-surface-hover">
                  {/* Foto */}
                  <td className="px-3 py-2">
                    <div className="h-10 w-10 shrink-0 overflow-hidden rounded-md border border-panel-border bg-panel-bg">
                      {actor.imagen_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={actor.imagen_url}
                          alt={actor.nombre ?? "Actor"}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <Users className="h-4 w-4 text-panel-text-muted" aria-hidden />
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Nombre */}
                  <td className="px-3 py-2">
                    <p className="font-medium text-panel-text">
                      {actor.nombre ?? "Sin nombre"}
                    </p>
                  </td>

                  {/* Género·Edad */}
                  <td className="hidden px-3 py-2 sm:table-cell">
                    {id?.genero ? (
                      <span className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-medium capitalize ${badge}`}>
                        {String(id.genero)}{id.edad ? ` · ${String(id.edad)}` : ""}
                      </span>
                    ) : (
                      <span className="text-xs text-panel-text-muted">—</span>
                    )}
                  </td>

                  {/* Ocupación */}
                  <td className="hidden px-3 py-2 md:table-cell">
                    <span className="text-xs text-panel-text-muted">
                      {id?.ocupacion ? String(id.ocupacion) : "—"}
                    </span>
                  </td>

                  {/* Acciones */}
                  <td className="px-3 py-2">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* Copiar prompt */}
                      {actor.prompt_carrusel && (
                        <button
                          type="button"
                          onClick={() => handleCopiar(actor.id, actor.prompt_carrusel!)}
                          title="Copiar prompt"
                          className="flex h-7 w-7 items-center justify-center rounded-md border border-panel-border text-panel-text-muted transition-colors hover:border-accent/50 hover:text-accent"
                        >
                          {copiado === actor.id ? (
                            <Check className="h-3.5 w-3.5" aria-hidden />
                          ) : (
                            <Copy className="h-3.5 w-3.5" aria-hidden />
                          )}
                        </button>
                      )}

                      {/* Cambiar foto */}
                      <input
                        ref={(el) => { fileInputs.current[actor.id] = el; }}
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        className="hidden"
                        onChange={(e) => handleSubirFoto(actor.id, e)}
                      />
                      <button
                        type="button"
                        onClick={() => fileInputs.current[actor.id]?.click()}
                        disabled={subiendoFoto === actor.id}
                        title={actor.imagen_url ? "Cambiar foto" : "Subir foto"}
                        className="flex h-7 w-7 items-center justify-center rounded-md border border-panel-border text-panel-text-muted transition-colors hover:border-accent/50 hover:text-accent disabled:opacity-50"
                      >
                        <ImagePlus className="h-3.5 w-3.5" aria-hidden />
                      </button>

                      {/* Eliminar */}
                      <button
                        type="button"
                        onClick={() => handleEliminar(actor.id, actor.nombre ?? "este actor")}
                        disabled={eliminando === actor.id}
                        title="Eliminar actor"
                        className="flex h-7 w-7 items-center justify-center rounded-md border border-panel-border text-panel-text-muted transition-colors hover:border-danger/50 hover:text-danger disabled:opacity-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" aria-hidden />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
