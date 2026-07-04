import Link from "next/link";
import type { PiezaHistorialResumen } from "@/lib/calendario/cargar-historial-piezas";
import { formatearFechaRelativaBolivia } from "@/lib/date/bolivia";
import { MetasVistasEscalera } from "@/app/(panel)/calendario/MetasVistasEscalera";
import { ProductoMiniatura } from "@/app/(panel)/productos/ProductoMiniatura";

type DashboardPublicacionesRecientesProps = {
  piezas: PiezaHistorialResumen[];
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

export function DashboardPublicacionesRecientes({
  piezas,
}: DashboardPublicacionesRecientesProps) {
  return (
    <section aria-labelledby="dashboard-publicaciones-titulo">
      <div className="mb-3 space-y-1">
        <h2
          id="dashboard-publicaciones-titulo"
          className="flex items-center gap-2.5 text-[15px] font-semibold text-panel-text"
        >
          <span className="h-4 w-1 rounded-sm bg-accent" aria-hidden />
          Publicaciones recientes
        </h2>
        <p className="pl-3.5 text-xs text-panel-text-muted">
          Últimos 11 días · marca las vistas alcanzadas
        </p>
      </div>

      {piezas.length === 0 ? (
        <p className="rounded-xl border border-dashed border-panel-border px-5 py-8 text-center text-sm text-panel-text-muted">
          No hay publicaciones recientes para puntuar.
        </p>
      ) : (
        <ul className="flex flex-col gap-4">
          {piezas.map((pieza) => {
            const hook = pieza.hook?.trim() || "Sin hook";
            const fecha = formatearFechaRelativaBolivia(pieza.creado_en);

            return (
              <li
                key={pieza.id}
                className="rounded-2xl border border-panel-border bg-[var(--surface-2)] p-5 transition-colors hover:border-[var(--border-strong)]"
              >
                <div className="flex flex-wrap items-start gap-x-4 gap-y-3">
                  <div className="flex min-w-[12rem] flex-1 items-start gap-4">
                    <ProductoMiniatura
                      nombre={pieza.productoNombre}
                      imagenUrl={pieza.imagenCajaUrl}
                      size="sm"
                    />

                    <div className="min-w-0 flex-1 space-y-1.5">
                      <p className="text-[15px] font-medium leading-snug text-panel-text">
                        {hook}
                      </p>
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
                      href={`/calendario/${pieza.id}`}
                      className="shrink-0 text-xs font-medium text-accent hover:underline"
                    >
                      Ver pieza →
                    </Link>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
