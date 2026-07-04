"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  Loader2,
  Lock,
  Save,
  ScrollText,
  Trash2,
} from "lucide-react";
import type { PromptMaestroCompleto } from "@/lib/prompts/prompts-maestros";
import { actualizarPromptAction, eliminarPromptAction } from "../../actions";

type EditarPromptFormProps = {
  prompt: PromptMaestroCompleto;
};

export function EditarPromptForm({ prompt }: EditarPromptFormProps) {
  const router = useRouter();
  const esSistema = !prompt.es_editable;

  const [nombre, setNombre] = useState(prompt.nombre);
  const [descripcion, setDescripcion] = useState(prompt.descripcion ?? "");
  const [contenido, setContenido] = useState(prompt.contenido);
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [eliminando, setEliminando] = useState(false);

  const inputClass =
    "w-full rounded-[10px] border border-panel-border bg-panel-bg px-3 py-2.5 text-sm text-panel-text placeholder:text-panel-text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent disabled:cursor-not-allowed disabled:opacity-70";

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (esSistema) return;

    setError(null);
    setGuardando(true);

    const formData = new FormData();
    formData.set("nombre", nombre);
    formData.set("descripcion", descripcion);
    formData.set("contenido", contenido);

    const result = await actualizarPromptAction(prompt.id, formData);
    if (!result.ok) {
      setError(result.error);
      setGuardando(false);
      return;
    }

    setGuardando(false);
    router.refresh();
  }

  async function handleEliminar() {
    const confirmar = window.confirm(
      `¿Eliminar el prompt "${prompt.nombre}" (${prompt.id})? Esta acción no se puede deshacer.`
    );
    if (!confirmar) return;

    setError(null);
    setEliminando(true);
    const result = await eliminarPromptAction(prompt.id);
    if (!result.ok) {
      setError(result.error);
      setEliminando(false);
      return;
    }

    router.push("/prompts");
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="border-b border-panel-border pb-4">
        <Link
          href="/prompts"
          className="mb-2.5 inline-flex items-center gap-1 text-sm text-panel-text-muted transition-colors hover:text-accent"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Volver a prompts
        </Link>
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-semibold text-panel-text">
            {esSistema ? "Ver prompt" : "Editar prompt"}
          </h1>
          <span className="rounded-md bg-[var(--surface-3)] px-2 py-0.5 font-mono text-xs text-panel-text-muted">
            {prompt.id}
          </span>
          {esSistema && (
            <span className="inline-flex items-center gap-1 rounded-md bg-[var(--surface-3)] px-2 py-0.5 text-xs text-panel-text-muted">
              <Lock className="h-3 w-3" aria-hidden />
              Sistema
            </span>
          )}
        </div>
        <p className="mt-1 text-sm text-panel-text-muted">{prompt.nombre}</p>
      </div>

      {esSistema && (
        <div
          className="flex gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4"
          role="alert"
        >
          <AlertTriangle
            className="mt-0.5 h-5 w-5 shrink-0 text-amber-400"
            aria-hidden
          />
          <div className="text-sm text-panel-text">
            <p className="font-medium text-amber-200">
              Prompt del sistema — solo lectura
            </p>
            <p className="mt-1 text-panel-text-muted">
              Este prompt está protegido y no se puede modificar ni eliminar
              desde el panel. Es la versión base que usa el motor en producción.
            </p>
          </div>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-panel-border bg-[var(--surface-2)] p-6"
      >
        <div className="mb-5 flex items-center gap-2">
          <ScrollText className="h-[18px] w-[18px] text-accent" aria-hidden />
          <h2 className="text-[15px] font-semibold text-panel-text">
            {esSistema ? "Contenido del prompt" : "Datos del prompt"}
          </h2>
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label
              htmlFor="editar-nombre"
              className="block text-xs font-medium text-panel-text-muted"
            >
              Nombre
            </label>
            <input
              id="editar-nombre"
              type="text"
              required
              readOnly={esSistema}
              disabled={esSistema}
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className={inputClass}
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="editar-descripcion"
              className="block text-xs font-medium text-panel-text-muted"
            >
              Descripción
            </label>
            <input
              id="editar-descripcion"
              type="text"
              readOnly={esSistema}
              disabled={esSistema}
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              className={inputClass}
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="editar-contenido"
              className="block text-xs font-medium text-panel-text-muted"
            >
              Contenido del prompt
            </label>
            <textarea
              id="editar-contenido"
              rows={18}
              required
              readOnly={esSistema}
              disabled={esSistema}
              value={contenido}
              onChange={(e) => setContenido(e.target.value)}
              className={`${inputClass} resize-y font-mono text-[13px] leading-relaxed`}
            />
          </div>
        </div>

        {error && (
          <p className="mt-4 text-sm text-danger" role="alert">
            {error}
          </p>
        )}

        {!esSistema && (
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={guardando || eliminando}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-bold text-panel-sidebar shadow-[0_4px_14px_rgba(245,158,11,0.25)] transition-all duration-150 hover:-translate-y-0.5 hover:bg-accent-strong disabled:translate-y-0 disabled:opacity-50 disabled:shadow-none"
            >
              {guardando ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              ) : (
                <Save className="h-4 w-4" aria-hidden />
              )}
              {guardando ? "Guardando..." : "Guardar cambios"}
            </button>

            <button
              type="button"
              onClick={handleEliminar}
              disabled={guardando || eliminando}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-danger/40 px-4 py-3 text-sm font-medium text-danger transition-colors hover:border-danger/60 hover:bg-danger/10 disabled:opacity-50"
            >
              {eliminando ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              ) : (
                <Trash2 className="h-4 w-4" aria-hidden />
              )}
              {eliminando ? "Eliminando..." : "Eliminar prompt"}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
