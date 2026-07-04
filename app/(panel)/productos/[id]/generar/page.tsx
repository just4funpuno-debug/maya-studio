import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { verificarAccesoProductoPagina } from "@/lib/auth/permisos";
import { cargarRecursosGeneracion } from "@/lib/motor/fotos-contexto";
import { createClient } from "@/lib/supabase/server";
import { GenerarPanel } from "./GenerarPanel";

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
      ? `Generar — ${producto.nombre} — Maya Studio`
      : "Generar — Maya Studio",
  };
}

export default async function ProductoGenerarPage({ params }: PageProps) {
  const { id } = await params;
  await verificarAccesoProductoPagina(id);
  const supabase = await createClient();
  const { data: producto, error } = await supabase
    .from("productos")
    .select("id, nombre, dia_actual, ciclo_actual")
    .eq("id", id)
    .single();
  if (error || !producto) {
    notFound();
  }
  const recursos = await cargarRecursosGeneracion(supabase, producto.id);
  return (
    <div className="flex flex-col gap-6">
      <div className="border-b border-panel-border pb-4">
        <Link
          href="/generar"
          className="mb-2.5 inline-flex items-center gap-1 text-sm text-panel-text-muted transition-colors hover:text-accent"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Volver a Generar
        </Link>
        <h1 className="text-2xl font-semibold text-panel-text">
          {producto.nombre}
        </h1>
        <p className="mt-1 text-sm text-panel-text-muted">
          Generar contenido del día
        </p>
      </div>
      <GenerarPanel
        productoId={producto.id}
        diaActual={producto.dia_actual}
        cicloActual={producto.ciclo_actual}
        recursos={recursos}
      />
    </div>
  );
}
