import type { Metadata } from "next";
import { obtenerUsuarioActual } from "@/lib/auth/usuario-actual";
import { cargarDashboard } from "@/lib/dashboard/cargar-dashboard";
import { cargarAnalisisTipos } from "@/lib/metricas/cargar-analisis-tipos";
import { createClient } from "@/lib/supabase/server";
import { esAdmin as checkAdmin } from "@/lib/auth/requiere-admin";
import { DashboardAnalisis } from "./dashboard/DashboardAnalisis";
import { DashboardEquipo } from "./dashboard/DashboardEquipo";
import { DashboardMetricas } from "./dashboard/DashboardMetricas";
import { DashboardPublicacionesRecientes } from "./dashboard/DashboardPublicacionesRecientes";
import { DashboardPulso } from "./dashboard/DashboardPulso";

export const metadata: Metadata = {
  title: "Inicio — Maya Studio",
};

export default async function InicioPage() {
  const usuario = await obtenerUsuarioActual();
  const datos = await cargarDashboard(usuario);

  let analisis: Awaited<ReturnType<typeof cargarAnalisisTipos>>["datos"] | null = null;
  if (checkAdmin(usuario)) {
    const supabase = await createClient();
    const resultado = await cargarAnalisisTipos(supabase);
    analisis = resultado.datos;
  }

  return (
    <div className="flex w-full flex-col gap-5">
      {/* Encabezado con saludo + badge de estado */}
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-panel-border pb-4">
        <div className="space-y-0.5">
          <h1 className="text-[26px] font-bold tracking-tight text-panel-text">
            Hola, <span className="text-accent">{datos.saludoNombre}</span>
          </h1>
          <p className="text-sm capitalize text-panel-text-muted">
            {datos.fechaHoy}
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-[10px] border border-panel-border bg-[var(--surface-2)] px-4 py-2.5 text-xs text-panel-text-muted">
          <span className="h-2 w-2 rounded-full bg-success shadow-[0_0_8px_var(--success)]" />
          Sistema activo
        </div>
      </header>

      {datos.error && (
        <p className="text-sm text-danger" role="alert">
          Algunos datos no se pudieron cargar: {datos.error}
        </p>
      )}

      {/* Fila compacta: Pulso (izq) + Métricas 2x2 (der) */}
      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <DashboardPulso pulso={datos.pulso} esAdmin={datos.esAdmin} />
        <DashboardMetricas metricas={datos.metricas} />
      </div>

      {/* Análisis: top 5 por red (solo admin) */}
      {analisis && <DashboardAnalisis datos={analisis} />}

      <DashboardPublicacionesRecientes
        piezas={datos.publicacionesRecientes}
      />

      {datos.equipo && <DashboardEquipo creadores={datos.equipo.creadores} />}
    </div>
  );
}
