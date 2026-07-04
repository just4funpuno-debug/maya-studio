"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { crearProducto } from "./actions";
import type { PublicoProducto } from "./actions";

const OPCIONES_PUBLICO: { valor: PublicoProducto; etiqueta: string }[] = [
  { valor: "unisex", etiqueta: "Unisex" },
  { valor: "hombres", etiqueta: "Hombres" },
  { valor: "mujeres", etiqueta: "Mujeres" },
];

export function CrearProductoForm() {
  const [nombre, setNombre] = useState("");
  const [documentoMaestro, setDocumentoMaestro] = useState("");
  const [publico, setPublico] = useState<PublicoProducto>("unisex");
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setGuardando(true);
    const result = await crearProducto(nombre, documentoMaestro, publico);
    if (!result.ok) {
      setError(result.error);
      setGuardando(false);
      return;
    }
    setNombre("");
    setDocumentoMaestro("");
    setPublico("unisex");
    setGuardando(false);
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
          Crear producto nuevo
        </h2>
      </div>

      <div className="space-y-4">
        <div className="space-y-1.5">
          <label
            htmlFor="nombre"
            className="block text-xs font-medium text-panel-text-muted"
          >
            Nombre del producto <span className="text-danger">*</span>
          </label>
          <input
            id="nombre"
            type="text"
            required
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Ej: Colágeno Premium"
            className={inputClass}
          />
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="documento_maestro"
            className="block text-xs font-medium text-panel-text-muted"
          >
            Documento maestro
          </label>
          <textarea
            id="documento_maestro"
            rows={8}
            value={documentoMaestro}
            onChange={(e) => setDocumentoMaestro(e.target.value)}
            placeholder="Pega aquí la ficha completa del producto..."
            className={`${inputClass} resize-y`}
          />
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="publico"
            className="block text-xs font-medium text-panel-text-muted"
          >
            Público objetivo
          </label>
          <select
            id="publico"
            value={publico}
            onChange={(e) => setPublico(e.target.value as PublicoProducto)}
            className={inputClass}
          >
            {OPCIONES_PUBLICO.map((op) => (
              <option
                key={op.valor}
                value={op.valor}
                style={{ backgroundColor: "#1a1f2e", color: "#cbd5e1" }}
              >
                {op.etiqueta}
              </option>
            ))}
          </select>
          <p className="text-[11px] text-panel-text-muted">
            ¿Para quién es este producto? Define el género de los actores que se generarán.
          </p>
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
        {guardando ? "Guardando..." : "Crear producto"}
      </button>
    </form>
  );
}
