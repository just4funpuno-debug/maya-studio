import Link from "next/link";
import { ArrowRight, Check, Clock } from "lucide-react";
import type { ProductoListado } from "@/lib/productos/cargar-lista-productos";
import { ProductoMiniatura } from "@/app/(panel)/productos/ProductoMiniatura";

type ProductoTarjetaGenerarProps = {
  producto: ProductoListado;
};

export function ProductoTarjetaGenerar({ producto }: ProductoTarjetaGenerarProps) {
  const generadoHoy = producto.generadoHoy;

  // Barrita superior de color según estado
  const barraColor = generadoHoy ? "bg-success" : "bg-danger";

  // El borde del contenedor: sutil por defecto, más marcado en pendientes (para
  // que el ojo vaya a lo que falta trabajar)
  const bordeContenedor = generadoHoy
    ? "border-panel-border"
    : "border-[var(--border-strong)]";

  // Atenuar las ya generadas para enfocar en las pendientes
  const opacidad = generadoHoy ? "opacity-60 hover:opacity-100" : "opacity-100";

  return (
    <Link
      href={`/productos/${producto.id}/generar`}
      className={`group relative flex flex-col overflow-hidden rounded-2xl border bg-panel-surface transition-all duration-150 hover:-translate-y-0.5 hover:border-[var(--border-strong)] hover:bg-panel-surface-hover ${bordeContenedor} ${opacidad}`}
    >
      {/* Barrita superior de color (estado) */}
      <span
        className={`absolute left-0 top-0 h-[3px] w-full ${barraColor}`}
        aria-hidden
      />

      <div className="flex flex-col p-5">
        {/* Fila superior: miniatura + chip de estado */}
        <div className="mb-4 flex items-start justify-between gap-3">
          <ProductoMiniatura
            nombre={producto.nombre}
            imagenUrl={producto.imagenCajaUrl}
            size="lg"
          />
          {generadoHoy ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[rgba(34,197,94,0.12)] px-2.5 py-1.5 text-[11px] font-medium text-success">
              <Check className="h-3 w-3" aria-hidden />
              Generado hoy
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[rgba(239,68,68,0.12)] px-2.5 py-1.5 text-[11px] font-medium text-danger">
              <Clock className="h-3 w-3" aria-hidden />
              Pendiente hoy
            </span>
          )}
        </div>

        {/* Nombre + ciclo/día */}
        <p className="text-[15px] font-semibold text-panel-text group-hover:text-accent">
          {producto.nombre}
        </p>
        <p className="mt-1 text-xs text-panel-text-muted">
          Ciclo {producto.ciclo_actual} · Día {producto.dia_actual}
        </p>

        {/* Zona de acción */}
        <div className="mt-4 flex items-center justify-between border-t border-panel-border pt-3.5">
          <span
            className={`text-[13px] ${
              generadoHoy
                ? "text-panel-text-muted"
                : "font-medium text-accent"
            }`}
          >
            {generadoHoy ? "Ver / generar" : "Generar ahora"}
          </span>
          <ArrowRight
            className="h-[18px] w-[18px] text-accent transition-transform duration-150 group-hover:translate-x-1"
            aria-hidden
          />
        </div>
      </div>
    </Link>
  );
}
