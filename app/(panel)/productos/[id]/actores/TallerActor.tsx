"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Copy,
  Check,
  ChevronDown,
  ImagePlus,
  Save,
  CheckCircle2,
} from "lucide-react";
import { generarActorAction, guardarActorConFoto } from "./actions";

type ActorGenerado = {
  nombre: string;
  identidad: Record<string, unknown>;
  descripcion_fisica: Record<string, unknown>;
  prompt_carrusel: string;
  notas: string | null;
};

type Props = {
  productoId: string;
};

const generoBadge: Record<string, string> = {
  mujer: "bg-pink-500/15 text-pink-300",
  hombre: "bg-blue-500/15 text-blue-300",
};

export function TallerActor({ productoId }: Props) {
  const router = useRouter();
  const [generando, setGenerando] = useState(false);
  const [actor, setActor] = useState<ActorGenerado | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiado, setCopiado] = useState(false);
  const [fisicoAbierto, setFisicoAbierto] = useState(false);
  const [fotoFile, setFotoFile] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [guardado, setGuardado] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleGenerar() {
    setError(null);
    setActor(null);
    setFotoFile(null);
    setFotoPreview(null);
    setGuardado(false);
    setGenerando(true);

    const result = await generarActorAction(productoId);

    if (!result.ok) {
      setError(result.error);
      setGenerando(false);
      return;
    }

    setActor({
      nombre: result.nombre,
      identidad: result.identidad,
      descripcion_fisica: result.descripcion_fisica,
      prompt_carrusel: result.prompt_carrusel,
      notas: result.notas,
    });
    setGenerando(false);
  }

  async function handleCopiar() {
    if (!actor) return;
    try {
      await navigator.clipboard.writeText(actor.prompt_carrusel);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      setError("No se pudo copiar.");
    }
  }

  function handleSeleccionarFoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFotoFile(file);
    setFotoPreview(URL.createObjectURL(file));
    setError(null);
  }

  async function handleGuardar() {
    if (!actor || !fotoFile) return;
    setError(null);
    setGuardando(true);

    const actorJson = JSON.stringify({
      nombre: actor.nombre,
      identidad: actor.identidad,
      descripcion_fisica: actor.descripcion_fisica,
      prompt_carrusel: actor.prompt_carrusel,
      notas: actor.notas,
    });

    const formData = new FormData();
    formData.append("imagen", fotoFile);

    const result = await guardarActorConFoto(productoId, actorJson, formData);

    if (!result.ok) {
      setError(result.error);
      setGuardando(false);
      return;
    }

    setGuardado(true);
    setGuardando(false);
    router.refresh();
  }

  function handleReiniciar() {
    setActor(null);
    setFotoFile(null);
    setFotoPreview(null);
    setGuardado(false);
    setError(null);
  }

  const id = actor?.identidad as Record<string, unknown> | undefined;
  const fisico = actor?.descripcion_fisica as Record<string, unknown> | undefined;
  const genero = (id?.genero as string)?.toLowerCase() ?? "";
  const badge = generoBadge[genero] ?? "bg-panel-surface-hover text-panel-text-muted";

  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="h-4 w-1 rounded-full bg-accent" aria-hidden />
        <h2 className="text-sm font-semibold text-panel-text">
          Taller de actores
        </h2>
      </div>

      <div className="grid gap-4 rounded-xl border border-panel-border bg-[var(--surface-2)] p-5 lg:grid-cols-2">
        {/* COLUMNA IZQUIERDA: Generar */}
        <div className="flex flex-col gap-4">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-panel-text-muted">
            1. Generar actor
          </h3>

          <button
            type="button"
            onClick={handleGenerar}
            disabled={generando || guardado}
            className="flex items-center gap-2 self-start rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-panel-sidebar transition-colors hover:bg-accent-strong disabled:opacity-60"
          >
            <Sparkles className="h-4 w-4" aria-hidden />
            {generando ? "Generando..." : "Generar actor con IA"}
          </button>

          {generando && (
            <p className="text-xs text-panel-text-muted">
              La IA está creando un actor nuevo (~10-15s)...
            </p>
          )}

          {error && (
            <p className="text-xs text-danger" role="alert">
              {error}
            </p>
          )}

          {/* Resultado del actor generado */}
          {actor && !guardado && (
            <div className="space-y-3 rounded-lg border border-accent/30 bg-accent/[0.04] p-4">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-medium text-panel-text">
                  {actor.nombre}
                </p>
                {id?.genero ? (
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] font-medium capitalize ${badge}`}
                  >
                    {String(id.genero)}
                    {id.edad ? ` · ${String(id.edad)}` : ""}
                  </span>
                ) : null}
              </div>

              {id?.ocupacion ? (
                <p className="text-xs text-panel-text-muted">
                  {String(id.ocupacion)}
                </p>
              ) : null}

              {id?.mini_contexto ? (
                <p className="text-sm leading-relaxed text-panel-text">
                  {String(id.mini_contexto)}
                </p>
              ) : null}

              {/* ADN visual desplegable */}
              {fisico && (
                <div>
                  <button
                    type="button"
                    onClick={() => setFisicoAbierto(!fisicoAbierto)}
                    className="flex items-center gap-1 text-xs text-accent hover:underline"
                    aria-expanded={fisicoAbierto}
                  >
                    Ver ADN visual
                    <ChevronDown
                      className={`h-3.5 w-3.5 transition-transform ${fisicoAbierto ? "rotate-180" : ""}`}
                      aria-hidden
                    />
                  </button>
                  {fisicoAbierto && (
                    <div className="mt-2 space-y-1 rounded-md bg-panel-bg p-3 text-[11px] text-panel-text-muted">
                      {fisico.rostro ? <p><span className="text-panel-text">Rostro:</span> {String(fisico.rostro)}</p> : null}
                      {fisico.piel ? <p><span className="text-panel-text">Piel:</span> {String(fisico.piel)}</p> : null}
                      {fisico.cabello ? <p><span className="text-panel-text">Cabello:</span> {String(fisico.cabello)}</p> : null}
                      {fisico.ojos ? <p><span className="text-panel-text">Ojos:</span> {String(fisico.ojos)}</p> : null}
                      {fisico.complexion ? <p><span className="text-panel-text">Complexión:</span> {String(fisico.complexion)}</p> : null}
                      {fisico.rasgos_distintivos ? <p><span className="text-panel-text">Rasgos:</span> {String(fisico.rasgos_distintivos)}</p> : null}
                    </div>
                  )}
                </div>
              )}

              {/* Prompt carrusel */}
              <div className="rounded-lg border border-panel-border bg-panel-bg p-3">
                <div className="mb-1.5 flex items-center justify-between gap-2">
                  <span className="text-[11px] font-medium text-panel-text">
                    Prompt para ChatGPT (fotos)
                  </span>
                  <button
                    type="button"
                    onClick={handleCopiar}
                    className="flex shrink-0 items-center gap-1 rounded-md border border-accent/40 bg-accent-muted px-2.5 py-1 text-[10px] font-medium text-accent transition-colors hover:bg-accent/20"
                  >
                    {copiado ? (
                      <><Check className="h-3 w-3" aria-hidden /> Copiado</>
                    ) : (
                      <><Copy className="h-3 w-3" aria-hidden /> Copiar</>
                    )}
                  </button>
                </div>
                <p className="line-clamp-4 text-[10px] leading-relaxed text-panel-text-muted">
                  {actor.prompt_carrusel}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* COLUMNA DERECHA: Subir foto + Guardar */}
        <div className="flex flex-col gap-4">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-panel-text-muted">
            2. Subir foto y guardar
          </h3>

          {!actor && !guardado && (
            <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed border-panel-border p-8">
              <p className="text-center text-xs text-panel-text-muted">
                Genera un actor a la izquierda.<br />
                Luego copia el prompt, genera las fotos en ChatGPT,<br />
                y sube la hoja de contactos aquí.
              </p>
            </div>
          )}

          {actor && !guardado && (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-accent/40 bg-accent/[0.03] p-6">
              {!fotoFile ? (
                <>
                  <p className="text-center text-xs text-panel-text-muted">
                    Sube la hoja de contactos de <span className="text-accent font-medium">{actor.nombre}</span>
                  </p>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="hidden"
                    onChange={handleSeleccionarFoto}
                  />
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="flex items-center gap-2 rounded-lg border border-accent/50 bg-accent-muted px-4 py-2.5 text-sm font-medium text-accent transition-colors hover:bg-accent/20"
                  >
                    <ImagePlus className="h-4 w-4" aria-hidden />
                    Seleccionar imagen
                  </button>
                  <p className="text-[10px] text-panel-text-muted">
                    JPG, PNG, WebP o GIF · Máximo 5 MB
                  </p>
                </>
              ) : (
                <>
                  {/* Preview de la foto seleccionada */}
                  {fotoPreview && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={fotoPreview}
                      alt="Preview"
                      className="h-28 w-28 rounded-lg border border-panel-border object-cover"
                    />
                  )}
                  <p className="text-xs text-panel-text-muted">
                    {fotoFile.name}
                  </p>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setFotoFile(null);
                        setFotoPreview(null);
                        if (fileRef.current) fileRef.current.value = "";
                      }}
                      className="rounded-md border border-panel-border px-3 py-1.5 text-xs text-panel-text-muted hover:text-panel-text"
                    >
                      Cambiar
                    </button>
                    <button
                      type="button"
                      onClick={handleGuardar}
                      disabled={guardando}
                      className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-panel-sidebar transition-colors hover:bg-accent-strong disabled:opacity-60"
                    >
                      <Save className="h-4 w-4" aria-hidden />
                      {guardando ? "Guardando..." : "Guardar actor"}
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {guardado && (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-lg border border-success/30 bg-success/[0.05] p-6">
              <CheckCircle2 className="h-8 w-8 text-success" />
              <p className="text-sm font-medium text-success">Actor guardado</p>
              <p className="text-xs text-panel-text-muted">
                {actor?.nombre} ya está en el banco de abajo con su foto.
              </p>
              <button
                type="button"
                onClick={handleReiniciar}
                className="mt-2 rounded-md border border-panel-border px-3 py-1.5 text-xs text-panel-text-muted hover:text-accent"
              >
                Generar otro actor
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
