const fs = require("fs");
const path = require("path");

function loadEnvLocal() {
  const envPath = path.join(__dirname, "..", "..", ".env.local");
  if (!fs.existsSync(envPath)) {
    throw new Error("No existe .env.local en la raíz del proyecto.");
  }

  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = val;
  }
}

function normalizarUsername(username) {
  return username.trim().toLowerCase();
}

function usernameToEmail(username) {
  return `${normalizarUsername(username)}@mayastudio.local`;
}

function esUsernameValido(username) {
  const n = normalizarUsername(username);
  return /^[a-z0-9][a-z0-9.]{2,31}$/.test(n);
}

function headersService(serviceKey) {
  return {
    apikey: serviceKey,
    Authorization: `Bearer ${serviceKey}`,
    "Content-Type": "application/json",
  };
}

function esRolValido(rol) {
  return rol === "admin" || rol === "creador";
}

/**
 * @param {{ username: string, password: string, nombre?: string, apellidos?: string, rol: string }} opts
 */
async function crearUsuario(opts) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const { username, password, nombre = "", apellidos = "", rol } = opts;

  const faltantes = [];
  if (!url) faltantes.push("NEXT_PUBLIC_SUPABASE_URL");
  if (!serviceKey) faltantes.push("SUPABASE_SERVICE_ROLE_KEY");
  if (!username) faltantes.push("username");
  if (!password) faltantes.push("password");
  if (!rol) faltantes.push("rol");

  if (faltantes.length > 0) {
    throw new Error("Faltan datos: " + faltantes.join(", "));
  }

  if (!esUsernameValido(username)) {
    throw new Error(
      "Username inválido. Usa 3–32 caracteres: letras minúsculas, números y puntos (ej. pedro.admin)."
    );
  }

  if (!esRolValido(rol)) {
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

  const existentes = await checkRes.json();
  if (existentes.length > 0) {
    throw new Error(
      `Ya existe un perfil con username "${usernameNorm}" en la tabla usuarios.`
    );
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

  const authBody = await authRes.json().catch(() => ({}));

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
      nombre: nombre || null,
      apellidos: apellidos || null,
      email: emailInterno,
      rol,
      auth_user_id: authUserId,
    }),
  });

  if (!insertRes.ok) {
    const text = await insertRes.text();
    throw new Error(
      `Error al insertar en usuarios: ${insertRes.status} ${text}\n` +
        "El usuario Auth fue creado. Elimínalo en el dashboard si quieres reintentar."
    );
  }

  return { username: usernameNorm, rol };
}

module.exports = {
  loadEnvLocal,
  crearUsuario,
};
