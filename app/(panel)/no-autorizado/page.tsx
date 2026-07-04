import Link from "next/link";
import { ShieldX } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "No autorizado — Maya Studio",
};

export default function NoAutorizadoPage() {
  return (
    <div className="flex flex-col items-center gap-6 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-danger/10">
        <ShieldX className="h-7 w-7 text-danger" aria-hidden />
      </div>
      <div className="max-w-md space-y-2">
        <h1 className="text-xl font-semibold text-panel-text">
          No tienes permiso para ver esta página
        </h1>
        <p className="text-sm text-panel-text-muted">
          Tu cuenta no tiene acceso a esta sección del panel. Si crees que es un
          error, contacta a un administrador.
        </p>
      </div>
      <Link
        href="/productos"
        className="rounded-md border border-accent/50 bg-accent-muted px-4 py-2 text-sm font-medium text-accent transition-colors hover:bg-accent/20"
      >
        Ir a productos
      </Link>
    </div>
  );
}
