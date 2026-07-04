"use client";

import { LogOut } from "lucide-react";
import { useFormStatus } from "react-dom";
import { cerrarSesion } from "@/app/(panel)/actions";

function BotonCerrarSesion() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-panel-text-muted transition-colors hover:bg-panel-surface-hover hover:text-panel-text disabled:opacity-60"
    >
      <LogOut className="h-4 w-4 shrink-0" aria-hidden />
      {pending ? "Cerrando sesión…" : "Cerrar sesión"}
    </button>
  );
}

export function CerrarSesionForm() {
  return (
    <form action={cerrarSesion} className="border-t border-panel-border p-3">
      <BotonCerrarSesion />
    </form>
  );
}
