"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, Package } from "lucide-react";
import { guardarAsignacionProductos } from "./actions";

export type ProductoAsignable = {
  id: string;
  nombre: string;
  imagenUrl: string | null;
};

type AsignarProductosFormProps = {
  usuarioId: string;
  productos: ProductoAsignable[];
  asignadosInicial: string[];
};

function ProductoMini({ nombre, imagenUrl }: { nombre: string; imagenUrl: string | null }) {
  if (imagenUrl) {
    return (
      <div className="h-11 w-11 shrink-0 overflow-hidden rounded-[10px] border border-panel-border bg-panel-bg">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={imagenUrl} alt="" className="h-full w-full object-cover" />
      </div>
    );
  }
  return (
    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px] border border-panel-border bg-panel-bg text-panel-text-muted">
      <Package className="h-5 w-5 opacity-60" strokeWidth={1.5} aria-hidden />
    </div>
  );
}

export function AsignarProductosForm({
  usuarioId,
  productos,
  asignadosInicial,
}: AsignarProductosFormProps) {
  const router = useRouter();
  const [seleccionados, setSeleccionados] = useState<Set<string>>(
    () => new Set(asignadosInicial)
  );
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [exito, setExito] = useState(false);

  function toggleProducto(productoId: string) {
    setExito(false);
    setSeleccionados((prev) => {
      const next = new Set(prev);
      if (next.has(productoId)) {
        next.delete(productoId);
      } else {
        next.add(productoId);
      }
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setExito(false);
    setGuardando(true);
    const result = await guardarAsignacionProductos(usuarioId, [
      ...seleccionados,
    ]);
    if (!result.ok) {
      setError(result.error);
      setGuardando(false);
      return;
    }
    setGuardando(false);
    setExito(true);
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-panel-border bg-[var(--surface-2)] p-6"
    >
      <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-[15px] font-semibold text-panel-text">
          Productos asignados
        </h2>
        <span className="rounded-full bg-[var(--surface-3)] px-3 py-1 text-xs text-panel-text-muted">
          {seleccionados.size} de {productos.length} activos
        </span>
      </div>
      <p className="mb-5 text-sm text-panel-text-muted">
        Activa los productos que este creador puede usar para generar contenido.
      </p>

      {productos.length === 0 ? (
        <p className="rounded-xl border border-dashed border-panel-border px-4 py-8 text-center text-sm text-panel-text-muted">
          No hay productos en el sistema. Crea productos primero.
        </p>
      ) : (
        <ul className="space-y-2.5">
          {productos.map((producto) => {
            const activo = seleccionados.has(producto.id);
            return (
              <li key={producto.id}>
                <button
                  type="button"
                  onClick={() => toggleProducto(producto.id)}
                  disabled={guardando}
                  aria-pressed={activo}
                  className={`flex w-full items-center gap-3.5 rounded-2xl border p-3.5 text-left transition-all duration-150 disabled:opacity-60 ${
                    activo
                      ? "border-[var(--border-strong)] bg-panel-surface"
                      : "border-panel-border bg-panel-surface/50 hover:border-[var(--border-strong)]"
                  }`}
                >
                  <ProductoMini
                    nombre={producto.nombre}
                    imagenUrl={producto.imagenUrl}
                  />
                  <span
                    className={`flex-1 text-sm font-medium ${
                      activo ? "text-panel-text" : "text-panel-text-muted"
                    }`}
                  >
                    {producto.nombre}
                  </span>
                  <span
                    className={`text-xs ${
                      activo ? "text-success" : "text-panel-text-muted"
                    }`}
                  >
                    {activo ? "Activo" : "Inactivo"}
                  </span>
                  {/* Switch cápsula */}
                  <span
                    className={`relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200 ${
                      activo ? "bg-success" : "bg-[var(--border-strong)]"
                    }`}
                    aria-hidden
                  >
                    <span
                      className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-all duration-200 ${
                        activo ? "left-6" : "left-1"
                      }`}
                    />
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {error && (
        <p className="mt-4 text-sm text-danger" role="alert">
          {error}
        </p>
      )}
      {exito && !error && (
        <p className="mt-4 text-sm text-success" role="status">
          Asignación guardada correctamente.
        </p>
      )}

      <button
        type="submit"
        disabled={guardando || productos.length === 0}
        className="mt-5 flex items-center justify-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-bold text-panel-sidebar shadow-[0_4px_14px_rgba(245,158,11,0.25)] transition-all duration-150 hover:-translate-y-0.5 hover:bg-accent-strong disabled:translate-y-0 disabled:opacity-60 disabled:shadow-none"
      >
        {guardando ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            Guardando…
          </>
        ) : (
          "Guardar asignación"
        )}
      </button>
    </form>
  );
}
