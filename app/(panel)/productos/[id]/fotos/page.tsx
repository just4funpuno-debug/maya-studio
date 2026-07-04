import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { verificarAdminPagina } from "@/lib/auth/requiere-admin";
import {
  CATEGORIAS_FOTO,
  CategoriaFoto,
} from "@/lib/storage/productos";
import { FotosPanel } from "./FotosPanel";
import type { FotoProducto } from "./SeccionFotosCategoria";

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
      ? `Fotos — ${producto.nombre} — Maya Studio`
      : "Fotos — Maya Studio",
  };
}

function fotosVaciasPorCategoria(): Record<CategoriaFoto, FotoProducto[]> {
  return {
    caja: [],
    frasco: [],
    capsulas: [],
  };
}

export default async function ProductoFotosPage({ params }: PageProps) {
  await verificarAdminPagina();
  const { id } = await params;
  const supabase = await createClient();

  const { data: producto, error: productoError } = await supabase
    .from("productos")
    .select("id, nombre, foto_perfil_url")
    .eq("id", id)
    .single();

  if (productoError || !producto) {
    notFound();
  }

  const [{ data: configFotos, error: configError }, { data: fotos, error: fotosError }] =
    await Promise.all([
      supabase
        .from("producto_config_fotos")
        .select("categoria, activo")
        .eq("producto_id", id),
      supabase
        .from("fotos_producto")
        .select("id, categoria, imagen_url, creado_en, es_principal")
        .eq("producto_id", id)
        .order("creado_en", { ascending: false }),
    ]);

  const activoPorCategoria = Object.fromEntries(
    CATEGORIAS_FOTO.map((c) => [c, false])
  ) as Record<CategoriaFoto, boolean>;

  for (const row of configFotos ?? []) {
    if (CATEGORIAS_FOTO.includes(row.categoria as CategoriaFoto)) {
      activoPorCategoria[row.categoria as CategoriaFoto] = row.activo;
    }
  }

  const fotosPorCategoria = fotosVaciasPorCategoria();
  for (const foto of fotos ?? []) {
    const cat = foto.categoria as CategoriaFoto;
    if (CATEGORIAS_FOTO.includes(cat)) {
      fotosPorCategoria[cat].push({
        id: foto.id,
        imagen_url: foto.imagen_url,
        creado_en: foto.creado_en,
        es_principal: foto.es_principal,
      });
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="space-y-2">
        <Link
          href="/productos"
          className="text-sm text-panel-text-muted hover:text-accent"
        >
          ← Volver a productos
        </Link>
        <h1 className="text-2xl font-semibold text-panel-text">{producto.nombre}</h1>
        <p className="text-panel-text-muted">Banco de fotos del producto</p>
      </div>

      {(configError || fotosError) && (
        <p className="text-sm text-danger" role="alert">
          No se pudo cargar las fotos:{" "}
          {configError?.message ?? fotosError?.message}
        </p>
      )}

      {!configError && !fotosError && (
        <FotosPanel
          productoId={producto.id}
          fotoPerfilUrl={producto.foto_perfil_url}
          activoPorCategoria={activoPorCategoria}
          fotosPorCategoria={fotosPorCategoria}
        />
      )}
    </div>
  );
}
