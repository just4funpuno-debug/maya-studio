/**
 * Atajo para crear un usuario admin (delega en crear-usuario-core).
 *
 * Requiere en .env.local:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *   ADMIN_USERNAME
 *   ADMIN_PASSWORD
 *   ADMIN_NOMBRE         (opcional)
 *   ADMIN_APELLIDOS      (opcional)
 *
 * Uso: npm run crear-admin
 */

const { loadEnvLocal, crearUsuario } = require("./lib/crear-usuario-core.cjs");

async function main() {
  loadEnvLocal();

  const resultado = await crearUsuario({
    username: process.env.ADMIN_USERNAME,
    password: process.env.ADMIN_PASSWORD,
    nombre: process.env.ADMIN_NOMBRE || "",
    apellidos: process.env.ADMIN_APELLIDOS || "",
    rol: "admin",
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
