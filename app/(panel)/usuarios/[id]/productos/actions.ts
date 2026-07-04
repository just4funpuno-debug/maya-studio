"use server";

import { requiereAdmin } from "@/lib/auth/requiere-admin";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type AsignacionResult =
  | { ok: true }
  | { ok: false; error: string };

export async function guardarAsignacionProductos(
  usuarioId: string,
  productoIds: string[]
): Promise<AsignacionResult> {
  const auth = await requiereAdmin();
  if (!auth.ok) return { ok: false, error: auth.error };

  const supabase = await createClient();

  const { data: usuario, error: usuarioError } = await supabase
    .from("usuarios")
    .select("id, rol, username")
    .eq("id", usuarioId)
    .maybeSingle();

  if (usuarioError) {
    return { ok: false, error: usuarioError.message };
  }

  if (!usuario) {
    return { ok: false, error: "No se encontró el usuario." };
  }

  if (usuario.rol !== "creador") {
    return {
      ok: false,
      error: "Solo se asignan productos a usuarios con rol Creador.",
    };
  }

  const idsUnicos = [...new Set(productoIds.filter(Boolean))];

  if (idsUnicos.length > 0) {
    const { data: productos, error: productosError } = await supabase
      .from("productos")
      .select("id")
      .in("id", idsUnicos);

    if (productosError) {
      return { ok: false, error: productosError.message };
    }

    if ((productos ?? []).length !== idsUnicos.length) {
      return { ok: false, error: "Uno o más productos no son válidos." };
    }
  }

  const { error: deleteError } = await supabase
    .from("usuario_productos")
    .delete()
    .eq("usuario_id", usuarioId);

  if (deleteError) {
    return { ok: false, error: deleteError.message };
  }

  if (idsUnicos.length > 0) {
    const { error: insertError } = await supabase.from("usuario_productos").insert(
      idsUnicos.map((productoId) => ({
        usuario_id: usuarioId,
        producto_id: productoId,
      }))
    );

    if (insertError) {
      return { ok: false, error: insertError.message };
    }
  }

  revalidatePath("/usuarios");
  revalidatePath(`/usuarios/${usuarioId}/productos`);
  revalidatePath("/productos");

  return { ok: true };
}
