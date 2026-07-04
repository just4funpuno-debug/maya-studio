"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Plus, UserPlus } from "lucide-react";
import { crearUsuarioAction } from "./actions";

const inputClass =
  "w-full rounded-[10px] border border-panel-border bg-panel-bg px-3 py-2.5 text-sm text-panel-text placeholder:text-panel-text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent disabled:opacity-60";

export function CrearUsuarioForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setError(null);
    setGuardando(true);
    const formData = new FormData(form);
    const result = await crearUsuarioAction(formData);
    if (!result.ok) {
      setError(result.error);
      setGuardando(false);
      return;
    }
    form.reset();
    setGuardando(false);
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-panel-border bg-[var(--surface-2)] p-6"
    >
      <div className="mb-5 flex items-center gap-2">
        <UserPlus className="h-[18px] w-[18px] text-accent" aria-hidden />
        <h2 className="text-[15px] font-semibold text-panel-text">
          Crear usuario nuevo
        </h2>
      </div>

      <div className="space-y-4">
        <div className="space-y-1.5">
          <label
            htmlFor="username"
            className="block text-xs font-medium text-panel-text-muted"
          >
            Usuario
          </label>
          <input
            id="username"
            name="username"
            type="text"
            required
            disabled={guardando}
            placeholder="ej. maria.creadora"
            autoComplete="off"
            className={inputClass}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label
              htmlFor="nombre"
              className="block text-xs font-medium text-panel-text-muted"
            >
              Nombre
            </label>
            <input
              id="nombre"
              name="nombre"
              type="text"
              disabled={guardando}
              className={inputClass}
            />
          </div>
          <div className="space-y-1.5">
            <label
              htmlFor="apellidos"
              className="block text-xs font-medium text-panel-text-muted"
            >
              Apellidos
            </label>
            <input
              id="apellidos"
              name="apellidos"
              type="text"
              disabled={guardando}
              className={inputClass}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="password"
            className="block text-xs font-medium text-panel-text-muted"
          >
            Contraseña
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={8}
            disabled={guardando}
            autoComplete="new-password"
            className={inputClass}
          />
          <p className="text-xs text-panel-text-muted">Mínimo 8 caracteres.</p>
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="rol"
            className="block text-xs font-medium text-panel-text-muted"
          >
            Rol
          </label>
          <select
            id="rol"
            name="rol"
            required
            disabled={guardando}
            defaultValue="creador"
            className={inputClass}
          >
            <option value="creador">Creador</option>
            <option value="admin">Administrador</option>
          </select>
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
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-4 py-3 text-sm font-bold text-panel-sidebar shadow-[0_4px_14px_rgba(245,158,11,0.25)] transition-all duration-150 hover:-translate-y-0.5 hover:bg-accent-strong disabled:translate-y-0 disabled:opacity-60 disabled:shadow-none"
      >
        <Plus className="h-4 w-4" aria-hidden />
        {guardando ? "Creando…" : "Crear usuario"}
      </button>
    </form>
  );
}
