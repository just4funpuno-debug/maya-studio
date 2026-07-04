"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { obtenerSeccionesNav } from "./nav-config";
import { CerrarSesionForm } from "./CerrarSesionForm";
import { UsuarioSidebar } from "./UsuarioSidebar";
import type { PerfilSidebar } from "@/lib/auth/perfil";

function SidebarContent({
  onNavigate,
  esAdmin,
}: {
  onNavigate?: () => void;
  esAdmin: boolean;
}) {
  const pathname = usePathname();
  const navSections = obtenerSeccionesNav(esAdmin);

  return (
    <>
      <div className="flex items-center gap-3 border-b border-panel-border px-5 py-4">
        <Image
          src="/images/logo-sidebar.png"
          alt="Maya Studio"
          width={36}
          height={36}
          className="h-9 w-9 object-contain"
        />
        <div>
          <p className="text-sm font-semibold text-accent">Maya Studio</p>
          <p className="text-xs text-panel-text-muted">Panel de contenido</p>
        </div>
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-4">
        {navSections.map((section) => (
          <div key={section.title}>
            <p className="mb-2 px-3 text-[10px] font-semibold tracking-wider text-panel-text-muted">
              {section.title}
            </p>
            <ul className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                const active = item.enabled && item.isActive(pathname);

                if (!item.enabled) {
                  return (
                    <li key={item.label}>
                      <span
                        className="flex cursor-not-allowed items-center gap-3 rounded-lg px-3 py-2 text-sm text-panel-text-muted/50"
                        title="Próximamente"
                      >
                        <Icon className="h-4 w-4 shrink-0" aria-hidden />
                        {item.label}
                      </span>
                    </li>
                  );
                }

                return (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      onClick={onNavigate}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                        active
                          ? "bg-accent-muted font-medium text-accent"
                          : "text-panel-text-muted hover:bg-panel-surface-hover hover:text-panel-text"
                      }`}
                    >
                      <Icon className="h-4 w-4 shrink-0" aria-hidden />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </>
  );
}

export function Sidebar({
  perfil,
  esAdmin,
}: {
  perfil: PerfilSidebar | null;
  esAdmin: boolean;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="fixed left-4 top-4 z-40 rounded-lg border border-panel-border bg-panel-sidebar p-2 text-panel-text lg:hidden"
        aria-label="Abrir menú"
      >
        <Menu className="h-5 w-5" />
      </button>

      {mobileOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          aria-label="Cerrar menú"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-60 flex-col border-r border-panel-border bg-panel-sidebar transition-transform lg:static lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <button
          type="button"
          onClick={() => setMobileOpen(false)}
          className="absolute right-3 top-4 rounded p-1 text-panel-text-muted hover:text-panel-text lg:hidden"
          aria-label="Cerrar menú"
        >
          <X className="h-5 w-5" />
        </button>
        <div className="flex min-h-0 flex-1 flex-col">
          <SidebarContent
            onNavigate={() => setMobileOpen(false)}
            esAdmin={esAdmin}
          />
          <UsuarioSidebar
            nombre={perfil?.nombre ?? null}
            rolEtiqueta={perfil?.rolEtiqueta ?? null}
          />
          <CerrarSesionForm />
        </div>
      </aside>
    </>
  );
}
