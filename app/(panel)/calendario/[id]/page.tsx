import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatearFechaRelativaBolivia } from "@/lib/date/bolivia";
import { cargarRecursosGeneracion } from "@/lib/motor/fotos-contexto";
import { PiezaVista } from "@/app/(panel)/productos/[id]/generar/PiezaVista";
import { MetasVistasEscalera } from "../MetasVistasEscalera";

type PageProps = {
  params: Promise<{ id: string }>;
};

type ProductoJoin = { nombre: string } | { nombre: string }[] | null;

function nombreProducto(join: ProductoJoin): string {
  if (!join) return "Producto";
  if (Array.isArray(join)) return join[0]?.nombre ?? "Producto";
  return join.nombre;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("piezas")
    .select("hook, productos ( nombre )")
    .eq("id", id)
    .eq("estado", "aprobado")
    .maybeSingle();

  const nombre = data ? nombreProducto(data.productos as ProductoJoin) : null;

  return {
    title: data?.hook
      ? `${data.hook.slice(0, 48)} — Calendario — Maya Studio`
      : nombre
        ? `${nombre} — Calendario — Maya Studio`
        : "Calendario — Maya Studio",
  };
}

export default async function CalendarioPiezaPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: pieza, error } = await supabase
    .from("piezas")
    .select(
      `
      id,
      producto_id,
      dia,
      ciclo,
      hook,
      creado_en,
      contenido_completo,
      meta_vistas_tiktok,
      meta_vistas_instagram,
      meta_vistas_facebook,
      productos ( nombre )
    `
    )
    .eq("id", id)
    .eq("estado", "aprobado")
    .maybeSingle();

  if (error || !pieza || !pieza.contenido_completo) {
    notFound();
  }

  const contenido = pieza.contenido_completo as Record<string, unknown>;
  const productoNombre = nombreProducto(pieza.productos as ProductoJoin);
  const recursos = await cargarRecursosGeneracion(supabase, pieza.producto_id);
  const fecha = formatearFechaRelativaBolivia(pieza.creado_en);

  return (
    <div className="flex flex-col gap-8">
      <div className="space-y-2">
        <Link
          href="/calendario"
          className="text-sm text-panel-text-muted hover:text-accent"
        >
          ← Volver al calendario
        </Link>
        <h1 className="text-2xl font-semibold text-panel-text">{productoNombre}</h1>
        <p className="text-sm text-panel-text-muted">
          {pieza.ciclo != null && pieza.dia != null
            ? `Ciclo ${pieza.ciclo} · Día ${pieza.dia}`
            : null}
          {pieza.ciclo != null && pieza.dia != null ? " · " : ""}
          {fecha}
        </p>
        {pieza.hook && (
          <p className="text-[15px] font-medium text-panel-text">{pieza.hook}</p>
        )}
      </div>

      <PiezaVista
        pieza={contenido}
        productoId={pieza.producto_id}
        recursos={recursos}
      />

      <MetasVistasEscalera
        piezaId={pieza.id}
        metasIniciales={{
          meta_vistas_tiktok: pieza.meta_vistas_tiktok ?? null,
          meta_vistas_instagram: pieza.meta_vistas_instagram ?? null,
          meta_vistas_facebook: pieza.meta_vistas_facebook ?? null,
        }}
      />
    </div>
  );
}
