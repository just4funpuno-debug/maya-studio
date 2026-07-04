import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { verificarAdminPagina } from "@/lib/auth/requiere-admin";
import { TiposToggleList } from "./TiposToggleList";

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data: producto } = await supabase
    .from("productos")
    .select("nombre")
    .eq("id", id)
    .single();

  return {
    title: producto
      ? `Tipos — ${producto.nombre} — Maya Studio`
      : "Tipos — Maya Studio",
  };
}

export default async function ProductoTiposPage({ params }: PageProps) {
  await verificarAdminPagina();
  const { id } = await params;
  const supabase = await createClient();

  const { data: producto, error: productoError } = await supabase
    .from("productos")
    .select("id, nombre")
    .eq("id", id)
    .single();

  if (productoError || !producto) {
    notFound();
  }

  const [{ data: tipos, error: tiposError }, { data: productoTipos, error: ptError }] =
    await Promise.all([
      supabase
        .from("tipos_contenido")
        .select("id, nombre, descripcion, tipo_salida")
        .order("nombre"),
      supabase
        .from("producto_tipos")
        .select("tipo_id, activo")
        .eq("producto_id", id),
    ]);

  const activosPorTipoId: Record<string, boolean> = {};
  for (const pt of productoTipos ?? []) {
    activosPorTipoId[pt.tipo_id] = pt.activo;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-2">
        <Link
          href="/productos"
          className="text-sm text-panel-text-muted hover:text-accent"
        >
          ← Volver a productos
        </Link>
        <h1 className="text-2xl font-semibold text-panel-text">{producto.nombre}</h1>
        <p className="text-panel-text-muted">Tipos de contenido activos</p>
      </div>

      {(tiposError || ptError) && (
        <p className="text-sm text-danger" role="alert">
          No se pudo cargar la configuración:{" "}
          {tiposError?.message ?? ptError?.message}
        </p>
      )}

      {tipos && tipos.length > 0 && (
        <TiposToggleList
          productoId={producto.id}
          tipos={tipos}
          activosPorTipoId={activosPorTipoId}
        />
      )}

      {tipos && tipos.length === 0 && (
        <p className="rounded-lg border border-dashed border-panel-border px-4 py-8 text-center text-panel-text-muted">
          No hay tipos de contenido en el catálogo.
        </p>
      )}
    </div>
  );
}
