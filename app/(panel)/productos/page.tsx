import type { Metadata } from "next";
import { cargarListaProductos } from "@/lib/productos/cargar-lista-productos";
import { verificarAdminPagina } from "@/lib/auth/requiere-admin";
import {
  cargarListaPromptsMaestros,
  mapaEtiquetasPrompts,
  resolverEtiquetaPrompt,
} from "@/lib/prompts/prompts-maestros";
import { createClient } from "@/lib/supabase/server";
import { CrearProductoForm } from "./CrearProductoForm";
import { EliminarProductoDialog } from "./EliminarProductoDialog";
import { ProductoAcciones } from "./ProductoAcciones";
import { ProductoMiniatura } from "./ProductoMiniatura";
import { PublicoSelector } from "./PublicoSelector";

export const metadata: Metadata = {
  title: "Productos — Maya Studio",
};

export default async function ProductosPage() {
  await verificarAdminPagina();
  const supabase = await createClient();
  const [{ productos, error }, { prompts }] = await Promise.all([
    cargarListaProductos(null),
    cargarListaPromptsMaestros(supabase),
  ]);
  const etiquetasPrompt = mapaEtiquetasPrompts(prompts);

  return (
    <div className="flex flex-col gap-6">
      <div className="border-b border-panel-border pb-4">
        <h1 className="text-2xl font-semibold text-panel-text">Productos</h1>
        <p className="mt-1 text-sm text-panel-text-muted">
          Configuración de productos: tipos, fotos, actores y motor de generación.
        </p>
      </div>

      {error && (
        <p className="text-sm text-danger" role="alert">
          No se pudo cargar la lista: {error}
        </p>
      )}

      <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        {/* Columna izquierda: lista de productos */}
        <div>
          <p className="mb-3 text-xs uppercase tracking-[0.05em] text-panel-text-muted">
            {productos.length === 0
              ? "Sin productos"
              : `${productos.length} producto${
                  productos.length === 1 ? "" : "s"
                }`}
          </p>

          {!error && productos.length === 0 ? (
            <p className="rounded-xl border border-dashed border-panel-border px-4 py-10 text-center text-sm text-panel-text-muted">
              Aún no hay productos. Crea el primero con el formulario.
            </p>
          ) : (
            <ul className="space-y-3">
              {productos.map((producto) => (
                <li
                  key={producto.id}
                  className="rounded-2xl border border-panel-border bg-panel-surface p-4 transition-colors hover:border-[var(--border-strong)]"
                >
                  <div className="mb-3.5 flex items-start gap-3.5">
                    <ProductoMiniatura
                      nombre={producto.nombre}
                      imagenUrl={producto.imagenCajaUrl}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-[15px] font-medium text-panel-text">
                        {producto.nombre}
                      </p>
                      <div className="mt-1 flex flex-wrap items-center gap-2">
                        <span className="text-xs text-panel-text-muted">
                          Ciclo {producto.ciclo_actual} · Día{" "}
                          {producto.dia_actual}
                        </span>
                        <span className="rounded-md bg-[var(--surface-3)] px-2 py-0.5 text-[11px] text-panel-text-muted">
                          Prompt{" "}
                          {resolverEtiquetaPrompt(
                            producto.version_prompt,
                            etiquetasPrompt
                          )}
                        </span>
                        <PublicoSelector
                          productoId={producto.id}
                          valorInicial={producto.publico}
                        />
                      </div>
                    </div>
                    <EliminarProductoDialog
                      productoId={producto.id}
                      nombre={producto.nombre}
                    />
                  </div>
                  <ProductoAcciones productoId={producto.id} />
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Columna derecha: crear producto */}
        <div className="lg:sticky lg:top-8 lg:self-start">
          <CrearProductoForm />
        </div>
      </div>
    </div>
  );
}
