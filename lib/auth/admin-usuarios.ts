import {
  esUsernameValido,
  normalizarUsername,
  usernameToEmail,
} from "@/lib/auth/username";
import type { RolUsuario } from "@/lib/auth/perfil";

export type CrearUsuarioInput = {
  username: string;
  password: string;
  nombre?: string;
  apellidos?: string;
  rol: RolUsuario;
};

function getServiceConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      "Falta configuración del servidor (SUPABASE_SERVICE_ROLE_KEY)."
    );
  }

  return { url, serviceKey };
}

function headersService(serviceKey: string) {
  return {
    apikey: serviceKey,
    Authorization: `Bearer ${serviceKey}`,
    "Content-Type": "application/json",
  };
}

export async function crearUsuarioConServiceRole(
  input: CrearUsuarioInput
): Promise<{ username: string; rol: RolUsuario }> {
  const { url, serviceKey } = getServiceConfig();
  const { username, password, nombre = "", apellidos = "", rol } = input;

  if (!username.trim() || !password) {
    throw new Error("Completa usuario y contraseña.");
  }

  if (!esUsernameValido(username)) {
    throw new Error(
      "Usuario inválido. Usa 3–32 caracteres: letras minúsculas, números y puntos (ej. pedro.admin)."
    );
  }

  if (rol !== "admin" && rol !== "creador") {
    throw new Error('Rol inválido. Debe ser "admin" o "creador".');
  }

  if (password.length < 8) {
    throw new Error("La contraseña debe tener al menos 8 caracteres.");
  }

  const usernameNorm = normalizarUsername(username);
  const emailInterno = usernameToEmail(usernameNorm);
  const hdrs = headersService(serviceKey);

  const checkRes = await fetch(
    `${url}/rest/v1/usuarios?username=eq.${encodeURIComponent(usernameNorm)}&select=id`,
    { headers: { ...hdrs, Accept: "application/json" } }
  );

  if (!checkRes.ok) {
    const text = await checkRes.text();
    throw new Error(`Error al consultar usuarios: ${checkRes.status} ${text}`);
  }

  const existentes = (await checkRes.json()) as { id: string }[];
  if (existentes.length > 0) {
    throw new Error(`El usuario "${usernameNorm}" ya existe.`);
  }

  const authRes = await fetch(`${url}/auth/v1/admin/users`, {
    method: "POST",
    headers: hdrs,
    body: JSON.stringify({
      email: emailInterno,
      password,
      email_confirm: true,
    }),
  });

  const authBody = (await authRes.json().catch(() => ({}))) as {
    id?: string;
    user?: { id?: string };
    msg?: string;
    message?: string;
  };

  if (!authRes.ok) {
    throw new Error(
      "Error al crear usuario en Auth: " +
        (authBody.msg || authBody.message || authRes.statusText)
    );
  }

  const authUserId = authBody.id ?? authBody.user?.id;
  if (!authUserId) {
    throw new Error("Auth no devolvió id de usuario.");
  }

  const insertRes = await fetch(`${url}/rest/v1/usuarios`, {
    method: "POST",
    headers: { ...hdrs, Prefer: "return=minimal" },
    body: JSON.stringify({
      username: usernameNorm,
      nombre: nombre.trim() || null,
      apellidos: apellidos.trim() || null,
      email: emailInterno,
      rol,
      auth_user_id: authUserId,
    }),
  });

  if (!insertRes.ok) {
    const text = await insertRes.text();
    throw new Error(
      `Error al guardar el perfil: ${insertRes.status} ${text}. ` +
        "El usuario Auth fue creado; elimínalo en Supabase si quieres reintentar."
    );
  }

  return { username: usernameNorm, rol };
}

export async function eliminarUsuarioConServiceRole(
  authUserId: string
): Promise<void> {
  const { url, serviceKey } = getServiceConfig();
  const hdrs = headersService(serviceKey);

  const deleteRes = await fetch(`${url}/auth/v1/admin/users/${authUserId}`, {
    method: "DELETE",
    headers: hdrs,
  });

  if (!deleteRes.ok) {
    const body = (await deleteRes.json().catch(() => ({}))) as {
      msg?: string;
      message?: string;
    };
    throw new Error(
      "Error al eliminar usuario en Auth: " +
        (body.msg || body.message || deleteRes.statusText)
    );
  }
}
