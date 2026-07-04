import type { UsuarioPerfil } from "@/lib/auth/perfil";
import { esAdmin } from "@/lib/auth/requiere-admin";
import { obtenerUsuarioActual } from "@/lib/auth/usuario-actual";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

/** IDs de productos asignados a un creador. Vacío si no hay asignaciones. */
export async function productosAsignadosIds(
  usuarioId: string
): Promise<string[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("usuario_productos")
    .select("producto_id")
    .eq("usuario_id", usuarioId);

  if (error) {
    throw new Error(`Error al leer asignaciones: ${error.message}`);
  }

  return (data ?? []).map((fila) => fila.producto_id);
}

/** Admin: acceso total. Creador: solo productos asignados. */
export async function puedeAccederProducto(
  usuario: UsuarioPerfil | null,
  productoId: string
): Promise<boolean> {
  if (!usuario) return false;
  if (esAdmin(usuario)) return true;

  const asignados = await productosAsignadosIds(usuario.id);
  return asignados.includes(productoId);
}

/**
 * Para páginas operativas de un producto (/generar).
 * Redirige si el creador no tiene el producto asignado.
 */
export async function verificarAccesoProductoPagina(
  productoId: string
): Promise<UsuarioPerfil> {
  const usuario = await obtenerUsuarioActual();
  if (!usuario) {
    redirect("/login");
  }

  const permitido = await puedeAccederProducto(usuario, productoId);
  if (!permitido) {
    redirect("/no-autorizado");
  }

  return usuario;
}

/**
 * Para Server Actions de generación.
 * Devuelve error si el creador no tiene el producto asignado.
 */
export async function requiereAccesoProducto(
  productoId: string
): Promise<
  | { ok: true; usuario: UsuarioPerfil }
  | { ok: false; error: string }
> {
  const usuario = await obtenerUsuarioActual();
  if (!usuario) {
    return { ok: false, error: "Sesión no válida." };
  }

  const permitido = await puedeAccederProducto(usuario, productoId);
  if (!permitido) {
    return { ok: false, error: "No tienes permiso para este producto." };
  }

  return { ok: true, usuario };
}
