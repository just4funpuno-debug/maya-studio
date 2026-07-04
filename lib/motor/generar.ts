import {
  createAnthropicClient,
} from "@/lib/anthropic/client";
import { leerPromptMaestro } from "@/lib/motor/leer-prompt-maestro";
import { resolverModeloIa } from "@/lib/motor/modelos";
import {
  cargarContextoFotos,
  formatearFotosParaPrompt,
  type ContextoFotosProducto,
} from "@/lib/motor/fotos-contexto";
import { parsearRespuestaJson } from "@/lib/motor/parsear-respuesta";
import { etapaMezclaContenido } from "@/lib/productos/avanzar-calendario";
import { createClient } from "@/lib/supabase/server";

const DIAS_HISTORIAL_MEMORIA = 45;

export type GenerarPiezaResult =
  | { ok: true; pieza: Record<string, unknown>; avisoMotor?: string }
  | {
      ok: false;
      error: string;
      raw?: string;
      parseError?: string;
    };

type TipoActivo = {
  nombre: string;
  descripcion: string | null;
  tipo_salida: string | null;
};

type PiezaHistorial = {
  dia: number | null;
  ciclo: number | null;
  tipo_contenido: string | null;
  hook: string | null;
  angulo: string | null;
  keyword: string | null;
};

type ActorDisponible = {
  nombre: string | null;
  perfil: string | null;
};

function formatearTiposActivos(tipos: TipoActivo[]): string {
  if (tipos.length === 0) return "(ninguno)";
  return tipos
    .map(
      (t, i) =>
        `${i + 1}. ${t.nombre} — ${t.tipo_salida ?? "sin salida"} — "${t.descripcion ?? ""}"`
    )
    .join("\n");
}

function formatearHistorial(piezas: PiezaHistorial[]): string {
  if (piezas.length === 0) return "Sin historial previo.";
  return piezas
    .map((p) => {
      const partes = [
        p.dia != null ? `Día ${p.dia}` : null,
        p.ciclo != null ? `Ciclo ${p.ciclo}` : null,
        p.tipo_contenido ? `tipo: ${p.tipo_contenido}` : null,
        p.hook ? `hook: "${p.hook}"` : null,
        p.angulo ? `ángulo: "${p.angulo}"` : null,
        p.keyword ? `keyword: "${p.keyword}"` : null,
      ].filter(Boolean);
      return `- ${partes.join(" | ")}`;
    })
    .join("\n");
}

function formatearActores(actores: ActorDisponible[]): string {
  if (actores.length === 0) return "Sin actores registrados.";
  return actores
    .map((a) => `- ${a.nombre ?? "Sin nombre"} — perfil: ${a.perfil ?? "(sin perfil)"}`)
    .join("\n");
}

function armarMensajeUsuario(params: {
  nombre: string;
  documentoMaestro: string | null;
  cicloActual: number;
  dia: number;
  tiposActivos: TipoActivo[];
  historial: PiezaHistorial[];
  actores: ActorDisponible[];
  fotos: ContextoFotosProducto;
}): string {
  const {
    nombre,
    documentoMaestro,
    cicloActual,
    dia,
    tiposActivos,
    historial,
    actores,
    fotos,
  } = params;

  return `## DATOS PARA ESTA GENERACIÓN

### PRODUCTO
- Nombre: ${nombre}

### FICHA DEL PRODUCTO
${documentoMaestro?.trim() || "(vacía — usar solo lo disponible y registrar faltantes en avisos)"}

### CONTEXTO DEL CALENDARIO
- Ciclo actual: ${cicloActual}
- Etapa de mezcla: ${etapaMezclaContenido(cicloActual)}
- Día a generar: ${dia}

### TIPOS DE CONTENIDO ACTIVOS
${formatearTiposActivos(tiposActivos)}

### HISTORIAL (NO repetir hooks, ángulos ni keywords)
${formatearHistorial(historial)}

### ACTORES DISPONIBLES (para piezas de guion)
${formatearActores(actores)}

### FOTOS DEL PRODUCTO
${formatearFotosParaPrompt(fotos)}

### INSTRUCCIÓN FINAL
Genera la ficha de producción para el DÍA ${dia} del CICLO ${cicloActual}.
- Elige el tipo de pieza entre los TIPOS ACTIVOS, respetando la mezcla del ciclo descrita en tus instrucciones y el historial para no repetir.
- Los campos "dia" y "ciclo" del JSON deben ser ${dia} y ${cicloActual}.
- Responde ÚNICAMENTE con el objeto JSON válido. Sin markdown, sin \`\`\`, sin texto antes ni después.`;
}

export async function generarPieza(
  productoId: string,
  dia: number
): Promise<GenerarPiezaResult> {
  if (dia < 1 || dia > 31) {
    return { ok: false, error: "El día debe estar entre 1 y 31." };
  }

  const supabase = await createClient();

  const { data: producto, error: productoError } = await supabase
    .from("productos")
    .select("id, nombre, documento_maestro, ciclo_actual, version_prompt, modelo_ia")
    .eq("id", productoId)
    .single();

  if (productoError || !producto) {
    return { ok: false, error: "Producto no encontrado." };
  }

  const corteHistorial = new Date();
  corteHistorial.setDate(corteHistorial.getDate() - DIAS_HISTORIAL_MEMORIA);
  const corteISO = corteHistorial.toISOString();

  const [
    { data: productoTipos, error: ptError },
    { data: piezas, error: piezasError },
    { data: actores, error: actoresError },
    fotosContexto,
  ] = await Promise.all([
    supabase
      .from("producto_tipos")
      .select(
        `
        tipos_contenido (
          nombre,
          descripcion,
          tipo_salida
        )
      `
      )
      .eq("producto_id", productoId)
      .eq("activo", true),
    supabase
      .from("piezas")
      .select("dia, ciclo, tipo_contenido, hook, angulo, keyword")
      .eq("producto_id", productoId)
      .gte("creado_en", corteISO)
      .order("creado_en", { ascending: true }),
    supabase
      .from("actores")
      .select("nombre, perfil")
      .eq("producto_id", productoId)
      .order("creado_en", { ascending: true }),
    cargarContextoFotos(supabase, productoId),
  ]);

  if (ptError) {
    return { ok: false, error: `Error al leer tipos activos: ${ptError.message}` };
  }
  if (piezasError) {
    return { ok: false, error: `Error al leer historial: ${piezasError.message}` };
  }
  if (actoresError) {
    return { ok: false, error: `Error al leer actores: ${actoresError.message}` };
  }

  type ProductoTipoRow = {
    tipos_contenido:
      | { nombre: string; descripcion: string | null; tipo_salida: string | null }
      | { nombre: string; descripcion: string | null; tipo_salida: string | null }[]
      | null;
  };

  const tiposActivos: TipoActivo[] = (productoTipos ?? [])
    .map((row: ProductoTipoRow) => {
      const tc = row.tipos_contenido;
      if (!tc) return null;
      return Array.isArray(tc) ? tc[0] : tc;
    })
    .filter((t): t is TipoActivo => t !== null);

  if (tiposActivos.length === 0) {
    return {
      ok: false,
      error: "No hay tipos de contenido activos para este producto.",
    };
  }

  const { modelo: modeloIa, usoFallback: modeloFallback } = resolverModeloIa(
    producto.modelo_ia
  );

  let promptMaestro: string;
  let avisoMotor: string | undefined;
  if (modeloFallback && producto.modelo_ia?.trim()) {
    avisoMotor = `El modelo "${producto.modelo_ia}" no está disponible. Se usó ${modeloIa.nombre}.`;
  }

  try {
    const resultado = await leerPromptMaestro(producto.version_prompt);
    promptMaestro = resultado.contenido;
    if (resultado.aviso) {
      avisoMotor = avisoMotor
        ? `${avisoMotor} ${resultado.aviso}`
        : resultado.aviso;
    }
  } catch {
    return { ok: false, error: "No se pudo leer el prompt maestro." };
  }

  const mensajeUsuario = armarMensajeUsuario({
    nombre: producto.nombre,
    documentoMaestro: producto.documento_maestro,
    cicloActual: producto.ciclo_actual,
    dia,
    tiposActivos,
    historial: piezas ?? [],
    actores: actores ?? [],
    fotos: fotosContexto,
  });

  let textoRespuesta: string;
  try {
    const client = createAnthropicClient();
    const message = await client.messages.create({
      model: modeloIa.id,
      max_tokens: 8000,
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

  return { ok: true, pieza: parseado.data, avisoMotor };
}
