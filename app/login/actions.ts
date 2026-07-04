"use server";

import { esUsernameValido, usernameToEmail } from "@/lib/auth/username";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export type IniciarSesionState =
  | { ok: true }
  | { ok: false; error: string };

export async function iniciarSesion(
  _prev: IniciarSesionState | null,
  formData: FormData
): Promise<IniciarSesionState> {
  const username = String(formData.get("username") ?? "");
  const password = String(formData.get("password") ?? "");
  const redirectTo = String(formData.get("redirect") ?? "/");

  if (!username.trim() || !password) {
    return { ok: false, error: "Completa usuario y contraseña." };
  }

  if (!esUsernameValido(username)) {
    return { ok: false, error: "Usuario o contraseña incorrectos." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: usernameToEmail(username),
    password,
  });

  if (error) {
    return { ok: false, error: "Usuario o contraseña incorrectos." };
  }

  const destino =
    redirectTo.startsWith("/") && !redirectTo.startsWith("//")
      ? redirectTo
      : "/";

  redirect(destino);
}
