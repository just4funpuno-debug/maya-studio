/**
 * Verifica que prompts_maestros en BD coincide con los archivos .md locales.
 * Requiere: .cursor/mcp.json
 *
 * Uso: node scripts/verificar-prompts-maestros.cjs
 */

const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const { runQuery } = require("./lib/supabase-mcp-query.cjs");

const PROMPTS_DIR = path.join(__dirname, "..", "prompts");

const VERSIONES = [
  { id: "v1.0", archivo: "prompt-maestro-v1.0.md" },
  { id: "v1.1", archivo: "prompt-maestro-v1.1.md" },
];

function sha256(texto) {
  return crypto.createHash("sha256").update(texto, "utf8").digest("hex");
}

async function main() {
  const filas = await runQuery(`
    SELECT id, nombre, length(contenido) AS chars, md5(contenido) AS md5, es_editable
    FROM public.prompts_maestros
    WHERE id IN ('v1.0', 'v1.1')
    ORDER BY id;
  `);

  const porId = Object.fromEntries((filas ?? []).map((f) => [f.id, f]));
  const reporte = [];
  let todoOk = true;

  for (const version of VERSIONES) {
    const ruta = path.join(PROMPTS_DIR, version.archivo);
    const archivo = fs.readFileSync(ruta, "utf-8");
    const hashArchivo = sha256(archivo);
    const md5Archivo = crypto.createHash("md5").update(archivo, "utf8").digest("hex");

    const fila = porId[version.id];
    if (!fila) {
      todoOk = false;
      reporte.push({
        id: version.id,
        estado: "FALTA_EN_BD",
        archivo: version.archivo,
      });
      continue;
    }

    const charsOk = Number(fila.chars) === archivo.length;
    const md5Ok = fila.md5 === md5Archivo;
    const identico = charsOk && md5Ok;

    if (!identico) todoOk = false;

    reporte.push({
      id: version.id,
      archivo: version.archivo,
      estado: identico ? "OK" : "DIFERENTE",
      chars_archivo: archivo.length,
      chars_bd: Number(fila.chars),
      md5_archivo: md5Archivo,
      md5_bd: fila.md5,
      es_editable: fila.es_editable,
      nombre_bd: fila.nombre,
    });
  }

  console.log(
    JSON.stringify(
      {
        ok: todoOk,
        mensaje: todoOk
          ? "El contenido en BD es idéntico a los archivos .md"
          : "Hay diferencias — revisa el reporte",
        reporte,
      },
      null,
      2
    )
  );

  if (!todoOk) process.exit(1);
}

main().catch((err) => {
  console.error(JSON.stringify({ ok: false, error: err.message }));
  process.exit(1);
});
