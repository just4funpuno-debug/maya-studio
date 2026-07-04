import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { verificarAdminPagina } from "@/lib/auth/requiere-admin";
import { TallerActor } from "./TallerActor";
import { BancoActores } from "./BancoActores";

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
      ? `Actores — ${producto.nombre} — Maya Studio`
      : "Actores — Maya Studio",
  };
}

export default async function ProductoActoresPage({ params }: PageProps) {
  await verificarAdminPagina();
  const { id } = await params;
  const supabase = await createClient();

  const { data: producto, error: productoError } = await supabase
    .from("productos")
    .select("id, nombre, publico")
    .eq("id", id)
    .single();

  if (productoError || !producto) {
    notFound();
  }

  const { data: actores, error: actoresError } = await supabase
    .from("actores")
    .select(
      "id, nombre, perfil, imagen_url, identidad, descripcion_fisica, prompt_carrusel, notas"
    )
    .eq("producto_id", id)
    .order("creado_en", { ascending: false });

  const etiquetaPublico: Record<string, string> = {
    unisex: "Unisex",
    hombres: "Hombres",
    mujeres: "Mujeres",
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Encabezado */}
      <div className="space-y-2">
        <Link
          href="/productos"
          className="text-sm text-panel-text-muted hover:text-accent"
        >
          ← Volver a productos
        </Link>
        <h1 className="text-2xl font-semibold text-panel-text">
          {producto.nombre}
        </h1>
        <p className="text-panel-text-muted">
          Banco de actores para testimonio y UGC ·{" "}
          <span className="text-panel-text">
            Público: {etiquetaPublico[producto.publico] ?? producto.publico}
          </span>
        </p>
      </div>

      {/* ZONA 1: Taller (generar + completar) */}
      <TallerActor productoId={producto.id} />

      {/* ZONA 2: Banco de actores */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="h-4 w-1 rounded-full bg-accent" aria-hidden />
          <h2 className="text-sm font-semibold text-panel-text">
            Banco de actores
          </h2>
          <span className="text-xs text-panel-text-muted">
            ({actores?.length ?? 0})
          </span>
        </div>

        {actoresError && (
          <p className="text-sm text-danger" role="alert">
            No se pudo cargar los actores: {actoresError.message}
          </p>
        )}

        {!actoresError && (
          <BancoActores productoId={producto.id} actores={actores ?? []} />
        )}
      </section>

    </div>
  );
}
