import type { RolUsuario, UsuarioPerfil } from "@/lib/auth/perfil";
import { createClient } from "@/lib/supabase/server";

export type { RolUsuario, UsuarioPerfil } from "@/lib/auth/perfil";

export async function obtenerUsuarioActual(): Promise<UsuarioPerfil | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from("usuarios")
    .select("id, username, nombre, apellidos, rol, email")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (error || !data) return null;

  if (data.rol !== "admin" && data.rol !== "creador") return null;

  return {
    id: data.id,
    username: data.username ?? user.email?.split("@")[0] ?? "usuario",
    nombre: data.nombre,
    apellidos: data.apellidos,
    rol: data.rol as RolUsuario,
    email: data.email,
  };
}
