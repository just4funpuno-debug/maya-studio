import type { Metadata } from "next";
import Link from "next/link";
import { cargarListaProductos } from "@/lib/productos/cargar-lista-productos";
import { esAdmin } from "@/lib/auth/requiere-admin";
import { obtenerUsuarioActual } from "@/lib/auth/usuario-actual";
import { ProductoTarjetaGenerar } from "./ProductoTarjetaGenerar";

export const metadata: Metadata = {
  title: "Generar — Maya Studio",
};

export default async function GenerarPage() {
  const usuario = await obtenerUsuarioActual();
  const usuarioEsAdmin = esAdmin(usuario);
  const { productos, error } = await cargarListaProductos(usuario);

  const pendientes = productos.filter((p) => !p.generadoHoy).length;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-panel-border pb-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold text-panel-text">Generar</h1>
          <p className="text-sm text-panel-text-muted">
            Elige un producto para generar el contenido del día.
          </p>
        </div>
        {productos.length > 0 && (
          <div className="flex items-center gap-2 rounded-[10px] border border-panel-border bg-[var(--surface-2)] px-4 py-2.5 text-xs text-panel-text-muted">
            <span
              className={`h-2 w-2 rounded-full ${
                pendientes > 0 ? "bg-danger" : "bg-success"
              }`}
            />
            {pendientes > 0
              ? `${pendientes} pendiente${pendientes === 1 ? "" : "s"} hoy`
              : "Todo listo hoy"}
          </div>
        )}
      </div>

      {error && (
        <p className="text-sm text-danger" role="alert">
          No se pudo cargar los productos: {error}
        </p>
      )}

      {!error && productos.length === 0 && (
        <p className="rounded-xl border border-dashed border-panel-border px-4 py-12 text-center text-sm text-panel-text-muted">
          {usuarioEsAdmin ? (
            <>
              Aún no hay productos.{" "}
              <Link href="/productos" className="text-accent hover:underline">
                Crea el primero en Productos
              </Link>
              .
            </>
          ) : (
            "Aún no tienes productos asignados. Contacta al administrador para que te asigne productos."
          )}
        </p>
      )}

      {productos.length > 0 && (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {productos.map((producto) => (
            <li key={producto.id}>
              <ProductoTarjetaGenerar producto={producto} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
