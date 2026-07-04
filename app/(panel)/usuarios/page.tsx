import type { Metadata } from "next";
import { etiquetaRol, nombreMostrable } from "@/lib/auth/perfil";
import type { RolUsuario } from "@/lib/auth/perfil";
import { verificarAdminPagina } from "@/lib/auth/requiere-admin";
import { createClient } from "@/lib/supabase/server";
import { CrearUsuarioForm } from "./CrearUsuarioForm";
import { UsuariosList } from "./UsuariosList";

export const metadata: Metadata = {
  title: "Usuarios — Maya Studio",
};

export default async function UsuariosPage() {
  const usuarioActual = await verificarAdminPagina();
  const supabase = await createClient();
  const { data: filas, error } = await supabase
    .from("usuarios")
    .select("id, username, nombre, apellidos, rol")
    .order("creado_en", { ascending: false });
  const usuarios =
    filas?.map((fila) => {
      const rol = fila.rol as RolUsuario;
      return {
        id: fila.id,
        username: fila.username ?? "—",
        nombreCompleto: nombreMostrable({
          id: fila.id,
          username: fila.username ?? "",
          nombre: fila.nombre,
          apellidos: fila.apellidos,
          rol,
          email: null,
        }),
        rolEtiqueta: etiquetaRol(rol),
        rol,
        esActual: fila.id === usuarioActual?.id,
      };
    }) ?? [];

  return (
    <div className="flex flex-col gap-6">
      <div className="border-b border-panel-border pb-4">
        <h1 className="text-2xl font-semibold text-panel-text">Usuarios</h1>
        <p className="mt-1 text-sm text-panel-text-muted">
          Gestiona las cuentas del panel. Los usuarios inician sesión con su
          nombre de usuario y contraseña.
        </p>
      </div>

      {error && (
        <p className="text-sm text-danger" role="alert">
          No se pudo cargar la lista: {error.message}
        </p>
      )}

      <div className="grid gap-5 lg:grid-cols-[1fr_1.2fr]">
        {/* Columna izquierda: formulario */}
        <div className="lg:sticky lg:top-8 lg:self-start">
          <CrearUsuarioForm />
        </div>

        {/* Columna derecha: lista */}
        <div>
          <p className="mb-3 text-xs uppercase tracking-[0.05em] text-panel-text-muted">
            {usuarios.length === 0
              ? "Sin usuarios"
              : `${usuarios.length} usuario${
                  usuarios.length === 1 ? "" : "s"
                } registrado${usuarios.length === 1 ? "" : "s"}`}
          </p>
          <UsuariosList usuarios={usuarios} />
        </div>
      </div>
    </div>
  );
}
