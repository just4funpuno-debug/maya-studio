/**
 * Migra los prompts maestros desde prompts/*.md a public.prompts_maestros.
 * Requiere: .cursor/mcp.json y tabla creada (supabase/prompts-maestros.sql).
 *
 * Uso: node scripts/migrar-prompts-maestros.cjs
 */

const fs = require("fs");
const path = require("path");
const { runQuery } = require("./lib/supabase-mcp-query.cjs");

const PROMPTS_DIR = path.join(__dirname, "..", "prompts");

/** Metadatos alineados con prompts/versiones.ts */
const VERSIONES = [
  {
    id: "v1.0",
    archivo: "prompt-maestro-v1.0.md",
    nombre: "Versión 1.0 (original)",
    descripcion: "Primera versión afinada para producción.",
    es_editable: false,
  },
  {
    id: "v1.1",
    archivo: "prompt-maestro-v1.1.md",
    nombre: "Versión 1.1",
    descripcion:
      "Captions, ortografía, claims médicos de presión y transformaciones.",
    es_editable: false,
  },
];

function escaparSqlLiteral(val) {
  return val.replace(/'/g, "''");
}

function dollarQuote(texto, tag) {
  const apertura = `$${tag}$`;
  if (texto.includes(apertura)) {
    throw new Error(`El contenido contiene el delimitador ${apertura}`);
  }
  return `${apertura}${texto}${apertura}`;
}

async function upsertPrompt(version, contenido) {
  const query = `
INSERT INTO public.prompts_maestros (id, nombre, descripcion, contenido, es_editable)
VALUES (
  '${escaparSqlLiteral(version.id)}',
  '${escaparSqlLiteral(version.nombre)}',
  ${version.descripcion ? `'${escaparSqlLiteral(version.descripcion)}'` : "NULL"},
  ${dollarQuote(contenido, `prompt_${version.id.replace(/\./g, "_")}`)},
  ${version.es_editable}
)
ON CONFLICT (id) DO UPDATE SET
  nombre = EXCLUDED.nombre,
  descripcion = EXCLUDED.descripcion,
  contenido = EXCLUDED.contenido,
  es_editable = EXCLUDED.es_editable;
`;

  await runQuery(query);
}

async function main() {
  const resultados = [];

  for (const version of VERSIONES) {
    const ruta = path.join(PROMPTS_DIR, version.archivo);
    if (!fs.existsSync(ruta)) {
      throw new Error(`No se encontró el archivo: ${ruta}`);
    }

    const contenido = fs.readFileSync(ruta, "utf-8");
    await upsertPrompt(version, contenido);

    resultados.push({
      id: version.id,
      archivo: version.archivo,
      chars: contenido.length,
      es_editable: version.es_editable,
    });
  }

  console.log(
    JSON.stringify({ ok: true, migrados: resultados }, null, 2)
  );
}

main().catch((err) => {
  console.error(JSON.stringify({ ok: false, error: err.message }));
  process.exit(1);
});
