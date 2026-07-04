"use server";

import {
  crearUsuarioConServiceRole,
  eliminarUsuarioConServiceRole,
} from "@/lib/auth/admin-usuarios";
import type { RolUsuario } from "@/lib/auth/perfil";
import { requiereAdmin } from "@/lib/auth/requiere-admin";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type AccionUsuarioResult =
  | { ok: true }
  | { ok: false; error: string };

export async function crearUsuarioAction(
  formData: FormData
): Promise<AccionUsuarioResult> {
  const auth = await requiereAdmin();
  if (!auth.ok) return { ok: false, error: auth.error };

  const username = String(formData.get("username") ?? "");
  const nombre = String(formData.get("nombre") ?? "");
  const apellidos = String(formData.get("apellidos") ?? "");
  const password = String(formData.get("password") ?? "");
  const rolRaw = String(formData.get("rol") ?? "");

  if (rolRaw !== "admin" && rolRaw !== "creador") {
    return { ok: false, error: "Selecciona un rol válido." };
  }

  const rol = rolRaw as RolUsuario;

  try {
    await crearUsuarioConServiceRole({
      username,
      password,
      nombre,
      apellidos,
      rol,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "No se pudo crear el usuario.";
    return { ok: false, error: message };
  }

  revalidatePath("/usuarios");
  return { ok: true };
}

export async function eliminarUsuarioAction(
  usuarioId: string
): Promise<AccionUsuarioResult> {
  const auth = await requiereAdmin();
  if (!auth.ok) return { ok: false, error: auth.error };

  if (usuarioId === auth.usuario.id) {
    return {
      ok: false,
      error: "No puedes eliminar tu propia cuenta.",
    };
  }

  const supabase = await createClient();
  const { data: usuario, error } = await supabase
    .from("usuarios")
    .select("id, auth_user_id, username")
    .eq("id", usuarioId)
    .maybeSingle();

  if (error) {
    return { ok: false, error: error.message };
  }

  if (!usuario?.auth_user_id) {
    return { ok: false, error: "No se encontró el usuario." };
  }

  try {
    await eliminarUsuarioConServiceRole(usuario.auth_user_id);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "No se pudo eliminar el usuario.";
    return { ok: false, error: message };
  }

  revalidatePath("/usuarios");
  return { ok: true };
}
