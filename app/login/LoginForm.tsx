"use client";

import { useActionState } from "react";
import { iniciarSesion, type IniciarSesionState } from "./actions";

type LoginFormProps = {
  redirectTo: string;
};

export function LoginForm({ redirectTo }: LoginFormProps) {
  const [state, formAction, pending] = useActionState<
    IniciarSesionState | null,
    FormData
  >(iniciarSesion, null);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="redirect" value={redirectTo} />

      <div className="space-y-1.5">
        <label
          htmlFor="username"
          className="block text-sm font-medium text-panel-text"
        >
          Usuario
        </label>
        <input
          id="username"
          name="username"
          type="text"
          autoComplete="username"
          required
          disabled={pending}
          placeholder="ej. maya.studio"
          className="w-full rounded-md border border-panel-border bg-panel-bg px-3 py-2 text-sm text-panel-text placeholder:text-panel-text-muted/60 focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/30 disabled:opacity-60"
        />
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor="password"
          className="block text-sm font-medium text-panel-text"
        >
          Contraseña
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          disabled={pending}
          className="w-full rounded-md border border-panel-border bg-panel-bg px-3 py-2 text-sm text-panel-text focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/30 disabled:opacity-60"
        />
      </div>

      {state?.ok === false && (
        <p className="text-sm text-danger" role="alert">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md border border-accent/50 bg-accent-muted px-4 py-2.5 text-sm font-medium text-accent transition-colors hover:bg-accent/20 disabled:opacity-60"
      >
        {pending ? "Entrando…" : "Entrar"}
      </button>
    </form>
  );
}
