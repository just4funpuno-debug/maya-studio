import type { LucideIcon } from "lucide-react";
import { CalendarDays, FileStack, Package, TrendingUp } from "lucide-react";
import type { DashboardMetricas } from "@/lib/dashboard/cargar-dashboard";

type DashboardMetricasProps = {
  metricas: DashboardMetricas;
};

type MetricaItem = {
  valor: number;
  etiqueta: string;
  icon: LucideIcon;
  color: string;
  bg: string;
};

function TarjetaMetrica({ valor, etiqueta, icon: Icon, color }: MetricaItem) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3.5 py-3 transition-all duration-150 hover:-translate-y-0.5 hover:border-[var(--border-strong)]">
      <span
        className="absolute left-0 top-0 h-full w-[3px]"
        style={{ background: color, opacity: 0.85 }}
        aria-hidden
      />
      <div className="flex items-center gap-1.5">
        <Icon className="h-[15px] w-[15px]" style={{ color }} aria-hidden />
        <p className="text-[22px] font-extrabold leading-none tracking-tight text-panel-text">
          {valor}
        </p>
      </div>
      <p className="mt-1 text-[11px] font-medium text-panel-text-muted">
        {etiqueta}
      </p>
    </div>
  );
}

export function DashboardMetricas({ metricas }: DashboardMetricasProps) {
  const items: MetricaItem[] = [
    {
      valor: metricas.piezasTotal,
      etiqueta: "Piezas generadas",
      icon: FileStack,
      color: "#f59e0b",
      bg: "rgba(245,158,11,0.15)",
    },
    {
      valor: metricas.piezasMes,
      etiqueta: "Este mes",
      icon: CalendarDays,
      color: "#38bdf8",
      bg: "rgba(56,189,248,0.15)",
    },
    {
      valor: metricas.productosActivos,
      etiqueta: "Productos activos",
      icon: Package,
      color: "#a78bfa",
      bg: "rgba(167,139,250,0.15)",
    },
    {
      valor: metricas.piezasSemana,
      etiqueta: "Ritmo (7 días)",
      icon: TrendingUp,
      color: "#22c55e",
      bg: "rgba(34,197,94,0.15)",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3.5">
      {items.map((item) => (
        <TarjetaMetrica key={item.etiqueta} {...item} />
      ))}
    </div>
  );
}
