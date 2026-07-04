import type { UsuarioPerfil } from "@/lib/auth/perfil";
import { obtenerUsuarioActual } from "@/lib/auth/usuario-actual";
import { redirect } from "next/navigation";

export const MENSAJE_SIN_PERMISO =
  "No tienes permiso para esta acción.";

export async function requiereAdmin(): Promise<
  | { ok: true; usuario: UsuarioPerfil }
  | { ok: false; error: string }
> {
  const usuario = await obtenerUsuarioActual();

  if (!usuario || usuario.rol !== "admin") {
    return { ok: false, error: MENSAJE_SIN_PERMISO };
  }

  return { ok: true, usuario };
}

/** Para Server Components de páginas admin: redirige si el usuario no es admin. */
export async function verificarAdminPagina(): Promise<UsuarioPerfil> {
  const auth = await requiereAdmin();
  if (!auth.ok) {
    redirect("/no-autorizado");
  }
  return auth.usuario;
}

export function esAdmin(usuario: UsuarioPerfil | null): boolean {
  return usuario?.rol === "admin";
}
