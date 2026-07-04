import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Calendar,
  Home,
  Package,
  ScrollText,
  Sparkles,
  UserCog,
} from "lucide-react";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  enabled: boolean;
  isActive: (pathname: string) => boolean;
};

export type NavSection = {
  title: string;
  items: NavItem[];
};

export function obtenerSeccionesNav(esAdmin: boolean): NavSection[] {
  const contenido: NavItem[] = [
    {
      label: "Generar",
      href: "/generar",
      icon: Sparkles,
      enabled: true,
      isActive: (pathname) =>
        pathname === "/generar" || pathname.includes("/generar"),
    },
    {
      label: "Calendario",
      href: "/calendario",
      icon: Calendar,
      enabled: true,
      isActive: (pathname) => pathname.startsWith("/calendario"),
    },
  ];

  if (esAdmin) {
    contenido.push({
      label: "Productos",
      href: "/productos",
      icon: Package,
      enabled: true,
      isActive: (pathname) =>
        pathname.startsWith("/productos") && !pathname.includes("/generar"),
    });
  }

  const sections: NavSection[] = [
    {
      title: "PRINCIPAL",
      items: [
        {
          label: "Inicio",
          href: "/",
          icon: Home,
          enabled: true,
          isActive: (pathname) => pathname === "/",
        },
      ],
    },
    {
      title: "CONTENIDO",
      items: contenido,
    },
  ];

  if (esAdmin) {
    sections.push({
      title: "ADMINISTRACIÓN",
      items: [
        {
          label: "Usuarios",
          href: "/usuarios",
          icon: UserCog,
          enabled: true,
          isActive: (pathname) => pathname.startsWith("/usuarios"),
        },
        {
          label: "Prompts",
          href: "/prompts",
          icon: ScrollText,
          enabled: true,
          isActive: (pathname) => pathname.startsWith("/prompts"),
        },
        {
          label: "Análisis",
          href: "/analisis",
          icon: BarChart3,
          enabled: true,
          isActive: (pathname) => pathname.startsWith("/analisis"),
        },
      ],
    });
  }

  return sections;
}
