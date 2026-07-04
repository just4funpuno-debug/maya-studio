import Link from "next/link";
import { Zap } from "lucide-react";
import type { DashboardPulso } from "@/lib/dashboard/cargar-dashboard";

type DashboardPulsoProps = {
  pulso: DashboardPulso;
  esAdmin: boolean;
};

export function DashboardPulso({ pulso, esAdmin }: DashboardPulsoProps) {
  const { total, listos, pendientes, porcentaje } = pulso;
  const sinProductos = total === 0;
  const botonTexto = pendientes > 0 ? "Generar pendientes" : "Ir a generar";

  return (
    <section
      aria-labelledby="dashboard-pulso-titulo"
      className="relative flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-[var(--border-strong)] px-4 py-3"
      style={{
        background:
          "radial-gradient(circle at top right, rgba(245,158,11,0.10), transparent 55%), linear-gradient(135deg, #171f2b 0%, #131820 100%)",
      }}
    >
      <h2 id="dashboard-pulso-titulo" className="sr-only">
        El pulso de hoy
      </h2>

      <div className="mb-1.5 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-panel-text-muted">
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
        </span>
        El pulso de hoy
      </div>

      {sinProductos ? (
        <div className="space-y-1.5">
          <p className="text-[30px] font-extrabold leading-none text-accent">
            0<span className="text-base font-bold text-panel-text-muted"> de 0</span>
          </p>
          <p className="text-[11px] text-panel-text-muted">
            {esAdmin
              ? "Aún no hay productos. Crea el primero."
              : "Sin productos asignados."}
          </p>
          {esAdmin && (
            <Link
              href="/productos"
              className="inline-flex items-center rounded-md border border-panel-border px-2.5 py-1 text-[11px] font-semibold text-panel-text hover:border-[var(--border-strong)]"
            >
              Ir a Productos
            </Link>
          )}
        </div>
      ) : (
        <>
          <div className="flex items-baseline gap-2">
            <span className="text-[30px] font-extrabold leading-none tracking-tight text-accent">
              {listos}
            </span>
            <span className="text-xs text-panel-text-muted">
              de {total} listos hoy
            </span>
          </div>

          {pendientes > 0 && (
            <p className="mt-1 flex items-center gap-1 text-[11px] text-danger">
              <span className="h-1.5 w-1.5 rounded-full bg-danger" />
              {pendientes} pendiente{pendientes === 1 ? "" : "s"}
            </p>
          )}

          <div className="mt-1.5">
            <div
              className="h-[5px] w-full overflow-hidden rounded-full bg-[var(--surface-3)]"
              role="progressbar"
              aria-valuenow={porcentaje}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Progreso del día"
            >
              <div
                className="h-full rounded-full bg-success shadow-[0_0_8px_rgba(34,197,94,0.4)] transition-all duration-500 ease-out"
                style={{ width: `${porcentaje}%` }}
              />
            </div>
            <div className="mt-0.5 flex justify-between text-[10px] text-panel-text-muted">
              <span>{porcentaje}%</span>
              <span>{listos}/{total}</span>
            </div>
          </div>

          <Link
            href="/generar"
            className="mt-2 inline-flex items-center gap-1.5 self-start rounded-md bg-accent px-3 py-1.5 text-[12px] font-bold text-panel-sidebar shadow-[0_2px_8px_rgba(245,158,11,0.2)] transition-all duration-150 hover:-translate-y-0.5 hover:bg-accent-strong"
          >
            <Zap className="h-3 w-3" aria-hidden />
            {botonTexto}
          </Link>
        </>
      )}
    </section>
  );
}
