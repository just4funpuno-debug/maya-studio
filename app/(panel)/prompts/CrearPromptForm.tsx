"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Plus } from "lucide-react";
import { crearPromptAction } from "./actions";

export function CrearPromptForm() {
  const router = useRouter();
  const [id, setId] = useState("");
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [contenido, setContenido] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setGuardando(true);

    const formData = new FormData();
    formData.set("id", id);
    formData.set("nombre", nombre);
    formData.set("descripcion", descripcion);
    formData.set("contenido", contenido);

    const result = await crearPromptAction(formData);
    if (!result.ok) {
      setError(result.error);
      setGuardando(false);
      return;
    }

    setId("");
    setNombre("");
    setDescripcion("");
    setContenido("");
    setGuardando(false);
    router.refresh();
  }

  const inputClass =
    "w-full rounded-[10px] border border-panel-border bg-panel-bg px-3 py-2.5 text-sm text-panel-text placeholder:text-panel-text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent";

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-panel-border bg-[var(--surface-2)] p-6"
    >
      <div className="mb-5 flex items-center gap-2">
        <Plus className="h-[18px] w-[18px] text-accent" aria-hidden />
        <h2 className="text-[15px] font-semibold text-panel-text">
          Crear prompt nuevo
        </h2>
      </div>

      <div className="space-y-4">
        <div className="space-y-1.5">
          <label
            htmlFor="prompt-id"
            className="block text-xs font-medium text-panel-text-muted"
          >
            Identificador <span className="text-danger">*</span>
          </label>
          <input
            id="prompt-id"
            type="text"
            required
            value={id}
            onChange={(e) => setId(e.target.value)}
            placeholder="Ej: v2.0 o agresivo-ventas"
            className={`${inputClass} font-mono`}
          />
          <p className="text-[11px] text-panel-text-muted">
            Único e irrepetible. Letras, números, puntos y guiones.
          </p>
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="prompt-nombre"
            className="block text-xs font-medium text-panel-text-muted"
          >
            Nombre <span className="text-danger">*</span>
          </label>
          <input
            id="prompt-nombre"
            type="text"
            required
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Ej: Versión 2.0 — ventas directas"
            className={inputClass}
          />
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="prompt-descripcion"
            className="block text-xs font-medium text-panel-text-muted"
          >
            Descripción
          </label>
          <input
            id="prompt-descripcion"
            type="text"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            placeholder="Breve nota sobre cuándo usar este prompt"
            className={inputClass}
          />
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="prompt-contenido"
            className="block text-xs font-medium text-panel-text-muted"
          >
            Contenido del prompt <span className="text-danger">*</span>
          </label>
          <textarea
            id="prompt-contenido"
            rows={12}
            required
            value={contenido}
            onChange={(e) => setContenido(e.target.value)}
            placeholder="Pega aquí el prompt maestro completo..."
            className={`${inputClass} resize-y font-mono text-[13px] leading-relaxed`}
          />
        </div>
      </div>

      {error && (
        <p className="mt-4 text-sm text-danger" role="alert">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={guardando}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-4 py-3 text-sm font-bold text-panel-sidebar shadow-[0_4px_14px_rgba(245,158,11,0.25)] transition-all duration-150 hover:-translate-y-0.5 hover:bg-accent-strong disabled:translate-y-0 disabled:opacity-50 disabled:shadow-none"
      >
        <Plus className="h-4 w-4" aria-hidden />
        {guardando ? "Creando..." : "Crear prompt"}
      </button>
    </form>
  );
}
