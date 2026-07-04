/**
 * Crea un usuario en Supabase Auth + fila en tabla usuarios con rol admin o creador.
 *
 * Requiere en .env.local:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *   CREAR_USERNAME
 *   CREAR_PASSWORD
 *   CREAR_ROL            (admin | creador)
 *   CREAR_NOMBRE         (opcional)
 *   CREAR_APELLIDOS      (opcional)
 *
 * Uso: npm run crear-usuario
 */

const { loadEnvLocal, crearUsuario } = require("./lib/crear-usuario-core.cjs");

async function main() {
  loadEnvLocal();

  const resultado = await crearUsuario({
    username: process.env.CREAR_USERNAME,
    password: process.env.CREAR_PASSWORD,
    nombre: process.env.CREAR_NOMBRE || "",
    apellidos: process.env.CREAR_APELLIDOS || "",
    rol: process.env.CREAR_ROL,
  });

  console.log(JSON.stringify({ ok: true, ...resultado }, null, 2));
  console.log(
    "\nListo. Inicia sesión en /login con tu usuario (sin @mayastudio.local)."
  );
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
