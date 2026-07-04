import { Users } from "lucide-react";

type DashboardEquipoProps = {
  creadores: number;
};

export function DashboardEquipo({ creadores }: DashboardEquipoProps) {
  return (
    <section aria-labelledby="dashboard-equipo-titulo">
      <h2
        id="dashboard-equipo-titulo"
        className="mb-3 flex items-center gap-2.5 text-[15px] font-semibold text-panel-text"
      >
        <span className="h-4 w-1 rounded-sm bg-accent" aria-hidden />
        Equipo
      </h2>
      <div
        className="flex items-center gap-4 rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-5 transition-colors duration-150 hover:border-[var(--border-strong)]"
        style={{
          background:
            "radial-gradient(circle at left, rgba(245,158,11,0.06), transparent 70%), var(--surface-2)",
        }}
      >
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent-muted">
          <Users className="h-6 w-6 text-accent" aria-hidden />
        </div>
        <div>
          <p className="text-[26px] font-extrabold leading-none text-panel-text">
            {creadores}
          </p>
          <p className="mt-1 text-[13px] text-panel-text-muted">
            {creadores === 1 ? "Creador activo" : "Creadores activos"}
          </p>
        </div>
      </div>
    </section>
  );
}
