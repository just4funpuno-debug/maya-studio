import { createAnthropicClient } from "@/lib/anthropic/client";
import { leerPromptMaestro } from "@/lib/motor/leer-prompt-maestro";
import { parsearRespuestaJson } from "@/lib/motor/parsear-respuesta";
import { createClient } from "@/lib/supabase/server";

const PROMPT_ACTORES_ID = "actores-v1.0";
const MODELO_ACTORES = "claude-sonnet-5";
const MAX_TOKENS_ACTORES = 4000;

export type ActorGenerado = {
  identidad: Record<string, unknown>;
  descripcion_fisica: Record<string, unknown>;
  prompt_carrusel: string;
  notas: string | null;
};

export type GenerarActorResult =
  | { ok: true; actor: ActorGenerado; avisoMotor?: string }
  | { ok: false; error: string; raw?: string; parseError?: string };

type ActorExistente = {
  nombre: string | null;
  perfil: string | null;
  identidad: Record<string, unknown> | null;
};

function formatearActoresExistentes(actores: ActorExistente[]): string {
  if (actores.length === 0) return "Ninguno — este es el primer actor del producto.";
  return actores
    .map((a, i) => {
      const partes: string[] = [`${i + 1}.`];
      if (a.identidad && typeof a.identidad === "object") {
        const id = a.identidad as Record<string, unknown>;
        if (id.nombre) partes.push(`Nombre: ${id.nombre}`);
        if (id.genero) partes.push(`Género: ${id.genero}`);
        if (id.edad) partes.push(`Edad: ${id.edad}`);
        if (id.ocupacion) partes.push(`Ocupación: ${id.ocupacion}`);
      } else {
        if (a.nombre) partes.push(`Nombre: ${a.nombre}`);
        if (a.perfil) partes.push(`Perfil: ${a.perfil}`);
      }
      return partes.join(" | ");
    })
    .join("\n");
}

function armarMensajeActor(params: {
  nombre: string;
  documentoMaestro: string | null;
  publico: string;
  actoresExistentes: ActorExistente[];
}): string {
  const { nombre, documentoMaestro, publico, actoresExistentes } = params;

  return `## DATOS PARA GENERAR ACTOR

### PRODUCTO
- Nombre: ${nombre}
- Público objetivo: ${publico}

### FICHA DEL PRODUCTO
${documentoMaestro?.trim() || "(sin ficha — genera un actor coherente con el nombre y público del producto)"}

### ACTORES YA CREADOS (para variedad — no repetir perfiles similares)
${formatearActoresExistentes(actoresExistentes)}

### INSTRUCCIÓN
Genera UN actor nuevo para este producto, respetando el público objetivo (${publico}) y diferenciándolo de los actores ya existentes.
Responde ÚNICAMENTE con el objeto JSON válido. Sin markdown, sin \`\`\`, sin texto antes ni después.`;
}

export async function generarActor(
  productoId: string
): Promise<GenerarActorResult> {
  const supabase = await createClient();

  const { data: producto, error: productoError } = await supabase
    .from("productos")
    .select("id, nombre, documento_maestro, publico")
    .eq("id", productoId)
    .single();

  if (productoError || !producto) {
    return { ok: false, error: "Producto no encontrado." };
  }

  const { data: actoresExistentes, error: actoresError } = await supabase
    .from("actores")
    .select("nombre, perfil, identidad")
    .eq("producto_id", productoId)
    .order("creado_en", { ascending: true });

  if (actoresError) {
    return { ok: false, error: `Error al leer actores existentes: ${actoresError.message}` };
  }

  let promptMaestro: string;
  let avisoMotor: string | undefined;

  try {
    const resultado = await leerPromptMaestro(PROMPT_ACTORES_ID);
    promptMaestro = resultado.contenido;
    if (resultado.aviso) {
      avisoMotor = resultado.aviso;
    }
  } catch {
    return { ok: false, error: `No se pudo leer el prompt "${PROMPT_ACTORES_ID}".` };
  }

  const mensajeUsuario = armarMensajeActor({
    nombre: producto.nombre,
    documentoMaestro: producto.documento_maestro,
    publico: producto.publico ?? "unisex",
    actoresExistentes: (actoresExistentes ?? []) as ActorExistente[],
  });

  let textoRespuesta: string;
  try {
    const client = createAnthropicClient();
    const message = await client.messages.create({
      model: MODELO_ACTORES,
      max_tokens: MAX_TOKENS_ACTORES,
      system: promptMaestro,
      messages: [{ role: "user", content: mensajeUsuario }],
    });

    let textoEncontrado: string | undefined;
    for (const bloque of message.content) {
      if (bloque.type === "text") {
        textoEncontrado = bloque.text;
        break;
      }
    }
    if (!textoEncontrado) {
      return { ok: false, error: "La API no devolvió texto." };
    }
    textoRespuesta = textoEncontrado;
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error al llamar a Anthropic";
    return { ok: false, error: msg };
  }

  const parseado = parsearRespuestaJson(textoRespuesta);
  if (!parseado.ok) {
    return {
      ok: false,
      error: "La respuesta no es JSON válido.",
      raw: parseado.raw,
      parseError: parseado.parseError,
    };
  }

  const data = parseado.data;

  const identidad = (data.identidad as Record<string, unknown>) ?? null;
  const descripcionFisica = (data.descripcion_fisica as Record<string, unknown>) ?? null;
  const promptCarrusel =
    typeof data.prompt_carrusel === "string" ? data.prompt_carrusel : null;
  const notas = typeof data.notas === "string" ? data.notas : null;

  if (!identidad || !descripcionFisica || !promptCarrusel) {
    return {
      ok: false,
      error: "La respuesta no tiene la estructura esperada (faltan identidad, descripcion_fisica o prompt_carrusel).",
      raw: textoRespuesta,
    };
  }

  return {
    ok: true,
    actor: {
      identidad,
      descripcion_fisica: descripcionFisica,
      prompt_carrusel: promptCarrusel,
      notas,
    },
    avisoMotor,
  };
}
