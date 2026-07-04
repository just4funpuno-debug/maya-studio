"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, Package, Trash2 } from "lucide-react";
import { eliminarUsuarioAction } from "./actions";
import type { RolUsuario } from "@/lib/auth/perfil";

export type UsuarioListado = {
  id: string;
  username: string;
  nombreCompleto: string;
  rolEtiqueta: string;
  rol: RolUsuario;
  esActual: boolean;
};

type UsuariosListProps = {
  usuarios: UsuarioListado[];
};

function iniciales(nombre: string, username: string): string {
  const base = nombre && nombre !== "—" ? nombre : username;
  const palabras = base.trim().split(/\s+/).filter(Boolean);
  if (palabras.length === 0) return "?";
  if (palabras.length === 1) return palabras[0].slice(0, 2).toUpperCase();
  return (palabras[0][0] + palabras[1][0]).toUpperCase();
}

/* Estilos por rol: admin naranja, creador azul */
function estiloRol(rol: RolUsuario): {
  avatarBg: string;
  avatarColor: string;
  badgeBg: string;
  badgeColor: string;
} {
  if (rol === "admin") {
    return {
      avatarBg: "rgba(245,158,11,0.15)",
      avatarColor: "#f59e0b",
      badgeBg: "rgba(245,158,11,0.15)",
      badgeColor: "#f59e0b",
    };
  }
  return {
    avatarBg: "rgba(56,189,248,0.15)",
    avatarColor: "#38bdf8",
    badgeBg: "rgba(56,189,248,0.15)",
    badgeColor: "#38bdf8",
  };
}

export function UsuariosList({ usuarios }: UsuariosListProps) {
  const router = useRouter();
  const [eliminando, setEliminando] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleEliminar(usuario: UsuarioListado) {
    const confirmar = window.confirm(
      `¿Eliminar al usuario "${usuario.username}"? Esta acción no se puede deshacer.`
    );
    if (!confirmar) return;
    setError(null);
    setEliminando(usuario.id);
    const result = await eliminarUsuarioAction(usuario.id);
    if (!result.ok) {
      setError(result.error);
      setEliminando(null);
      return;
    }
    setEliminando(null);
    router.refresh();
  }

  if (usuarios.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-panel-border px-4 py-10 text-center text-sm text-panel-text-muted">
        Aún no hay usuarios registrados. Crea el primero con el formulario.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {error && (
        <p className="text-sm text-danger" role="alert">
          {error}
        </p>
      )}
      <ul className="space-y-2.5">
        {usuarios.map((usuario) => {
          const est = estiloRol(usuario.rol);
          const esEliminando = eliminando === usuario.id;
          return (
            <li
              key={usuario.id}
              className="flex flex-wrap items-center gap-3.5 rounded-2xl border border-panel-border bg-panel-surface p-4 transition-colors hover:border-[var(--border-strong)]"
            >
              {/* Avatar de iniciales */}
              <div
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-[15px] font-bold"
                style={{ background: est.avatarBg, color: est.avatarColor }}
                aria-hidden
              >
                {iniciales(usuario.nombreCompleto, usuario.username)}
              </div>

              {/* Datos */}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium text-panel-text">
                    {usuario.username}
                  </span>
                  <span
                    className="rounded-md px-2 py-0.5 text-[11px] font-medium"
                    style={{ background: est.badgeBg, color: est.badgeColor }}
                  >
                    {usuario.rolEtiqueta}
                  </span>
                  {usuario.esActual && (
                    <span className="text-[11px] text-panel-text-muted">
                      (tú)
                    </span>
                  )}
                </div>
                {usuario.nombreCompleto &&
                  usuario.nombreCompleto !== usuario.username && (
                    <p className="mt-0.5 truncate text-xs text-panel-text-muted">
                      {usuario.nombreCompleto}
                    </p>
                  )}
              </div>

              {/* Acciones */}
              <div className="flex shrink-0 items-center gap-2">
                {usuario.rol === "creador" && (
                  <Link
                    href={`/usuarios/${usuario.id}/productos`}
                    className="flex items-center gap-1.5 rounded-[9px] border border-[var(--border-strong)] px-3 py-1.5 text-xs font-medium text-accent transition-colors hover:border-accent/50 hover:bg-accent-muted"
                  >
                    <Package className="h-3.5 w-3.5" aria-hidden />
                    Asignar productos
                  </Link>
                )}
                <button
                  type="button"
                  onClick={() => handleEliminar(usuario)}
                  disabled={usuario.esActual || esEliminando}
                  title={
                    usuario.esActual
                      ? "No puedes eliminar tu propia cuenta"
                      : "Eliminar usuario"
                  }
                  aria-label="Eliminar usuario"
                  className="flex items-center justify-center rounded-[9px] border border-[var(--border-strong)] p-2 text-panel-text-muted transition-colors hover:border-danger/50 hover:text-danger disabled:cursor-not-allowed disabled:border-panel-border disabled:opacity-40"
                >
                  {esEliminando ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
                  ) : (
                    <Trash2 className="h-3.5 w-3.5" aria-hidden />
                  )}
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
