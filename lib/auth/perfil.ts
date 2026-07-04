export type RolUsuario = "admin" | "creador";

export type UsuarioPerfil = {
  id: string;
  username: string;
  nombre: string | null;
  apellidos: string | null;
  rol: RolUsuario;
  email: string | null;
};

/** Datos ya resueltos para mostrar en el sidebar (seguro para Client Components). */
export type PerfilSidebar = {
  nombre: string;
  rolEtiqueta: string;
};

export function nombreMostrable(perfil: UsuarioPerfil): string {
  const partes = [perfil.nombre, perfil.apellidos].filter(Boolean);
  if (partes.length > 0) return partes.join(" ");
  return perfil.username;
}

export function etiquetaRol(rol: RolUsuario): string {
  return rol === "admin" ? "Administrador" : "Creador";
}

export function perfilParaSidebar(
  perfil: UsuarioPerfil
): PerfilSidebar {
  return {
    nombre: nombreMostrable(perfil),
    rolEtiqueta: etiquetaRol(perfil.rol),
  };
}
