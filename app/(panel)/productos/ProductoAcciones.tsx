import Link from "next/link";
import { Cpu, ListChecks, ImageIcon, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type ProductoAccionesProps = {
  productoId: string;
};

type Acceso = {
  slug: string;
  label: string;
  icon: LucideIcon;
};

const ACCESOS: Acceso[] = [
  { slug: "prompt", label: "Motor", icon: Cpu },
  { slug: "tipos", label: "Tipos", icon: ListChecks },
  { slug: "fotos", label: "Fotos", icon: ImageIcon },
  { slug: "actores", label: "Actores", icon: Users },
];

export function ProductoAcciones({ productoId }: ProductoAccionesProps) {
  return (
    <div className="grid grid-cols-4 gap-2 border-t border-panel-border pt-3.5">
      {ACCESOS.map(({ slug, label, icon: Icon }) => (
        <Link
          key={slug}
          href={`/productos/${productoId}/${slug}`}
          className="flex flex-col items-center gap-1.5 rounded-[10px] bg-[var(--surface-3)] px-2 py-2.5 transition-colors hover:bg-accent-muted"
        >
          <Icon className="h-[18px] w-[18px] text-accent" aria-hidden />
          <span className="text-[11px] font-medium text-panel-text">
            {label}
          </span>
        </Link>
      ))}
    </div>
  );
}
