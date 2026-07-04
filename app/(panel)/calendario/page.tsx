import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { obtenerUsuarioActual } from "@/lib/auth/usuario-actual";
import {
  cargarHistorialPiezas,
  cargarProductosParaFiltro,
} from "@/lib/calendario/cargar-historial-piezas";
import { CalendarioFiltro } from "./CalendarioFiltro";
import { HistorialPiezaFila } from "./HistorialPiezaFila";

export const metadata: Metadata = {
  title: "Calendario — Maya Studio",
};

type PageProps = {
  searchParams: Promise<{ producto?: string }>;
};

export default async function CalendarioPage({ searchParams }: PageProps) {
  const { producto: productoFiltro } = await searchParams;
  const usuario = await obtenerUsuarioActual();

  const [historialRes, productosFiltro] = await Promise.all([
    cargarHistorialPiezas(productoFiltro || null),
    cargarProductosParaFiltro(usuario),
  ]);

  const { piezas, error } = historialRes;
  const productoValido =
    productoFiltro && productosFiltro.some((p) => p.id === productoFiltro)
      ? productoFiltro
      : null;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-panel-text">Calendario</h1>
          <p className="text-panel-text-muted">
            Historial de contenido aprobado
          </p>
        </div>

        <Suspense fallback={null}>
          <CalendarioFiltro
            productos={productosFiltro}
            productoSeleccionado={productoValido}
          />
        </Suspense>
      </div>

      {error && (
        <p className="text-sm text-danger" role="alert">
          No se pudo cargar el historial: {error}
        </p>
      )}

      {!error && piezas.length === 0 && (
        <p className="rounded-xl border border-dashed border-panel-border px-6 py-10 text-center text-panel-text-muted">
          Aún no hay contenido generado.{" "}
          <Link href="/generar" className="text-accent hover:underline">
            Empieza a generar en la sección Generar
          </Link>
          .
        </p>
      )}

      {!error && piezas.length > 0 && (
        <ul className="flex flex-col gap-2">
          {piezas.map((pieza) => (
            <HistorialPiezaFila key={pieza.id} pieza={pieza} />
          ))}
        </ul>
      )}
    </div>
  );
}
