"use client";

import { ChevronDown } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

type CalendarioFiltroProps = {
  productos: { id: string; nombre: string }[];
  productoSeleccionado: string | null;
};

export function CalendarioFiltro({
  productos,
  productoSeleccionado,
}: CalendarioFiltroProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleChange(productoId: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (productoId) {
      params.set("producto", productoId);
    } else {
      params.delete("producto");
    }
    const query = params.toString();
    router.push(query ? `/calendario?${query}` : "/calendario");
  }

  return (
    <div className="relative w-full sm:w-64">
      <label htmlFor="filtro-producto-calendario" className="sr-only">
        Filtrar por producto
      </label>
      <select
        id="filtro-producto-calendario"
        value={productoSeleccionado ?? ""}
        onChange={(e) => handleChange(e.target.value)}
        className="w-full appearance-none rounded-lg border-[0.5px] border-panel-border bg-[var(--surface-2)] py-2.5 pl-4 pr-10 text-sm text-panel-text transition-[border-color,background-color] duration-150 hover:border-[var(--border-strong)] hover:bg-panel-surface-hover focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/30"
      >
        <option value="">Todos los productos</option>
        {productos.map((p) => (
          <option key={p.id} value={p.id}>
            {p.nombre}
          </option>
        ))}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-panel-text-muted"
        aria-hidden
      />
    </div>
  );
}
