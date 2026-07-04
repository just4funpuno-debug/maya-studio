import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound, redirect } from "next/navigation";
import { nombreMostrable } from "@/lib/auth/perfil";
import type { RolUsuario } from "@/lib/auth/perfil";
import { productosAsignadosIds } from "@/lib/auth/permisos";
import { verificarAdminPagina } from "@/lib/auth/requiere-admin";
import { createClient } from "@/lib/supabase/server";
import { AsignarProductosForm } from "./AsignarProductosForm";

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data: usuario } = await supabase
    .from("usuarios")
    .select("username, nombre, apellidos")
    .eq("id", id)
    .maybeSingle();
  const etiqueta =
    usuario?.username ??
    (usuario
      ? nombreMostrable({
          id,
          username: usuario.username ?? "",
          nombre: usuario.nombre,
          apellidos: usuario.apellidos,
          rol: "creador",
          email: null,
        })
      : null);
  return {
    title: etiqueta
      ? `Productos — ${etiqueta} — Maya Studio`
      : "Asignar productos — Maya Studio",
  };
}

export default async function UsuarioProductosPage({ params }: PageProps) {
  await verificarAdminPagina();
  const { id } = await params;
  const supabase = await createClient();
  const { data: usuario, error: usuarioError } = await supabase
    .from("usuarios")
    .select("id, username, nombre, apellidos, rol")
    .eq("id", id)
    .maybeSingle();
  if (usuarioError) {
    return (
      <p className="text-sm text-danger" role="alert">
        No se pudo cargar el usuario: {usuarioError.message}
      </p>
    );
  }
  if (!usuario) {
    notFound();
  }
  if (usuario.rol !== "creador") {
    redirect("/usuarios");
  }

  const [{ data: productosRaw, error: productosError }, asignados] =
    await Promise.all([
      supabase
        .from("productos")
        .select("id, nombre, foto_perfil_url")
        .order("nombre"),
      productosAsignadosIds(usuario.id),
    ]);

  // Resolver la foto a mostrar: perfil si existe (la de caja se puede sumar
  // luego si se quiere; aquí usamos perfil como imagen decorativa del panel)
  const productos = (productosRaw ?? []).map((p) => ({
    id: p.id,
    nombre: p.nombre,
    imagenUrl: (p.foto_perfil_url as string | null) ?? null,
  }));

  const nombreUsuario = nombreMostrable({
    id: usuario.id,
    username: usuario.username ?? "",
    nombre: usuario.nombre,
    apellidos: usuario.apellidos,
    rol: usuario.rol as RolUsuario,
    email: null,
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="border-b border-panel-border pb-4">
        <Link
          href="/usuarios"
          className="mb-2.5 inline-flex items-center gap-1 text-sm text-panel-text-muted transition-colors hover:text-accent"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Volver a usuarios
        </Link>
        <h1 className="text-2xl font-semibold text-panel-text">
          Asignar productos
        </h1>
        <p className="mt-1 text-sm text-panel-text-muted">
          Creador:{" "}
          <span className="text-panel-text">{nombreUsuario}</span> (
          {usuario.username})
        </p>
      </div>

      {productosError && (
        <p className="text-sm text-danger" role="alert">
          No se pudieron cargar los productos: {productosError.message}
        </p>
      )}

      <AsignarProductosForm
        usuarioId={usuario.id}
        productos={productos}
        asignadosInicial={asignados}
      />
    </div>
  );
}
