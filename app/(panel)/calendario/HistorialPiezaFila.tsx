import Link from "next/link";
import { formatearFechaRelativaBolivia } from "@/lib/date/bolivia";
import type { PiezaHistorialResumen } from "@/lib/calendario/cargar-historial-piezas";
import { MetasVistasEscalera } from "@/app/(panel)/calendario/MetasVistasEscalera";
import { ProductoMiniatura } from "@/app/(panel)/productos/ProductoMiniatura";

type HistorialPiezaFilaProps = {
  pieza: PiezaHistorialResumen;
};

function metadatosPieza(
  pieza: PiezaHistorialResumen,
  fecha: string
): string {
  const partes: string[] = [pieza.productoNombre];

  if (pieza.tipo_contenido?.trim()) {
    partes.push(pieza.tipo_contenido.trim());
  }

  if (pieza.ciclo != null && pieza.dia != null) {
    partes.push(`Ciclo ${pieza.ciclo}`);
    partes.push(`Día ${pieza.dia}`);
  } else if (pieza.ciclo != null) {
    partes.push(`Ciclo ${pieza.ciclo}`);
  } else if (pieza.dia != null) {
    partes.push(`Día ${pieza.dia}`);
  }

  partes.push(fecha);
  return partes.join(" · ");
}

export function HistorialPiezaFila({ pieza }: HistorialPiezaFilaProps) {
  const hook = pieza.hook?.trim() || "Sin hook";
  const fecha = formatearFechaRelativaBolivia(pieza.creado_en);
  const href = `/calendario/${pieza.id}`;

  return (
    <li className="rounded-xl border-[0.5px] border-panel-border bg-[var(--surface-2)] px-5 py-4 transition-[border-color,background-color] duration-150 hover:border-[var(--border-strong)] hover:bg-panel-surface-hover">
      <div className="flex flex-wrap items-start gap-x-4 gap-y-3">
        <div className="flex min-w-[12rem] flex-1 items-start gap-4">
          <Link href={href} className="shrink-0">
            <ProductoMiniatura
              nombre={pieza.productoNombre}
              imagenUrl={pieza.imagenCajaUrl}
              size="sm"
            />
          </Link>

          <div className="min-w-0 flex-1 space-y-1.5">
            <Link
              href={href}
              className="block text-[15px] font-medium leading-snug text-panel-text hover:text-accent"
            >
              {hook}
            </Link>
            <p className="text-xs leading-relaxed text-panel-text-muted">
              <time dateTime={pieza.creado_en}>
                {metadatosPieza(pieza, fecha)}
              </time>
            </p>
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap items-center justify-end gap-2 sm:max-w-[18rem]">
          <MetasVistasEscalera
            piezaId={pieza.id}
            variant="embedded"
            metasIniciales={{
              meta_vistas_tiktok: pieza.meta_vistas_tiktok,
              meta_vistas_instagram: pieza.meta_vistas_instagram,
              meta_vistas_facebook: pieza.meta_vistas_facebook,
            }}
          />
          <Link
            href={href}
            className="shrink-0 text-xs font-medium text-accent hover:underline"
          >
            Ver pieza →
          </Link>
        </div>
      </div>
    </li>
  );
}
