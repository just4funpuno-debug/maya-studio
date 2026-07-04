import type { SupabaseClient } from "@supabase/supabase-js";
import {
  CATEGORIAS_FOTO,
  CategoriaFoto,
  ETIQUETAS_CATEGORIA,
} from "@/lib/storage/productos";

export type ContextoFotosProducto = {
  categoriasActivas: CategoriaFoto[];
  categoriasConFotos: CategoriaFoto[];
  categoriasInactivas: CategoriaFoto[];
  fotosPrincipales: Partial<Record<CategoriaFoto, string>>;
};

export type ActorRecurso = {
  id: string;
  nombre: string | null;
  imagen_url: string | null;
  perfil: string | null;
};

export type RecursosGeneracion = {
  fotos: ContextoFotosProducto;
  actores: ActorRecurso[];
};

const CATEGORIAS_CONTENIDO: CategoriaFoto[] = ["frasco", "capsulas"];

function esCategoriaFoto(val: string): val is CategoriaFoto {
  return (CATEGORIAS_FOTO as readonly string[]).includes(val);
}

function str(val: unknown): string | null {
  return typeof val === "string" && val.trim() ? val.trim() : null;
}

export async function cargarContextoFotos(
  supabase: SupabaseClient,
  productoId: string
): Promise<ContextoFotosProducto> {
  const [{ data: config }, { data: fotos }] = await Promise.all([
    supabase
      .from("producto_config_fotos")
      .select("categoria, activo")
      .eq("producto_id", productoId),
    supabase
      .from("fotos_producto")
      .select("categoria, imagen_url, es_principal")
      .eq("producto_id", productoId),
  ]);

  const categoriasActivas: CategoriaFoto[] = [];
  for (const row of config ?? []) {
    if (row.activo && esCategoriaFoto(row.categoria)) {
      categoriasActivas.push(row.categoria);
    }
  }

  const conteo: Partial<Record<CategoriaFoto, number>> = {};
  const fotosPrincipales: Partial<Record<CategoriaFoto, string>> = {};

  for (const foto of fotos ?? []) {
    if (!esCategoriaFoto(foto.categoria)) continue;
    const cat = foto.categoria;
    conteo[cat] = (conteo[cat] ?? 0) + 1;
    if (foto.es_principal && foto.imagen_url) {
      fotosPrincipales[cat] = foto.imagen_url;
    }
  }

  const categoriasConFotos = categoriasActivas.filter(
    (c) => (conteo[c] ?? 0) > 0
  );
  const categoriasInactivas = CATEGORIAS_FOTO.filter(
    (c) => !categoriasActivas.includes(c)
  );

  return {
    categoriasActivas,
    categoriasConFotos,
    categoriasInactivas,
    fotosPrincipales,
  };
}

export async function cargarRecursosGeneracion(
  supabase: SupabaseClient,
  productoId: string
): Promise<RecursosGeneracion> {
  const [fotos, { data: actores }] = await Promise.all([
    cargarContextoFotos(supabase, productoId),
    supabase
      .from("actores")
      .select("id, nombre, imagen_url, perfil")
      .eq("producto_id", productoId)
      .order("creado_en", { ascending: true }),
  ]);

  return {
    fotos,
    actores: actores ?? [],
  };
}

export function formatearFotosParaPrompt(ctx: ContextoFotosProducto): string {
  const lineasActivas = CATEGORIAS_FOTO.filter((c) =>
    ctx.categoriasActivas.includes(c)
  ).map((c) => {
    const etiqueta = ETIQUETAS_CATEGORIA[c];
    const estado = ctx.categoriasConFotos.includes(c)
      ? "con fotos"
      : "sin fotos aún — falta subir en el panel";
    const rol =
      c === "caja" ? "empaque / caja del producto" : "contenido interno del producto";
    return `- ${c} (${etiqueta}, ${estado}) — ${rol}`;
  });

  const lineasInactivas = ctx.categoriasInactivas.map(
    (c) => `- ${c} (${ETIQUETAS_CATEGORIA[c]}): NO disponible — categoría desactivada`
  );

  const lista =
    lineasActivas.length > 0
      ? [...lineasActivas, ...lineasInactivas].join("\n")
      : "(ninguna categoría de fotos activa para este producto)";

  return `Categorías disponibles para este producto:
${lista}

MAPEO referencia_producto → categorías reales:
- "empaque" → caja
- "contenido" → frasco o cápsulas (elige la más apropiada según el clip; incluye "categoria" cuando definas cuál)
- "ambas" → caja + la categoría de contenido que aplique

REGLAS OBLIGATORIAS:
- Solo referencia categorías ACTIVAS listadas arriba.
- Nunca pidas frasco, cápsulas ni caja si no está en la lista de activas.
- Si una categoría activa no tiene fotos, puedes referenciarla igual; el panel avisará al creador.
- En referencia_producto incluye "categoria": "caja"|"frasco"|"capsulas" cuando aplique, además del campo "tipo" (empaque/contenido/ambas).`;
}

export function mapearTipoReferenciaACategorias(
  tipo: string,
  categoriaExplicita: string | null,
  ctx: ContextoFotosProducto
): CategoriaFoto[] {
  const activas = new Set(ctx.categoriasActivas);
  const contenidoActivas = CATEGORIAS_CONTENIDO.filter((c) => activas.has(c));

  if (
    categoriaExplicita &&
    esCategoriaFoto(categoriaExplicita) &&
    activas.has(categoriaExplicita)
  ) {
    return [categoriaExplicita];
  }

  const t = tipo.toLowerCase();
  if (t === "empaque") {
    return activas.has("caja") ? ["caja"] : [];
  }
  if (t === "contenido") {
    return contenidoActivas;
  }
  if (t === "ambas") {
    const result: CategoriaFoto[] = [];
    if (activas.has("caja")) result.push("caja");
    result.push(...contenidoActivas);
    return result;
  }
  return [];
}

function agregarCategoriasDesdeTexto(
  texto: string,
  ctx: ContextoFotosProducto,
  destino: Set<CategoriaFoto>
) {
  const lower = texto.toLowerCase();
  if (lower.includes("frasco") && ctx.categoriasActivas.includes("frasco")) {
    destino.add("frasco");
  }
  if (
    (lower.includes("cápsul") || lower.includes("capsul")) &&
    ctx.categoriasActivas.includes("capsulas")
  ) {
    destino.add("capsulas");
  }
  if (lower.includes("caja") && ctx.categoriasActivas.includes("caja")) {
    destino.add("caja");
  }
}

export function extraerCategoriasReferenciadas(
  pieza: Record<string, unknown>,
  ctx: ContextoFotosProducto
): CategoriaFoto[] {
  const cats = new Set<CategoriaFoto>();

  if (Array.isArray(pieza.clips)) {
    for (const clip of pieza.clips) {
      if (!clip || typeof clip !== "object") continue;
      const ref = (clip as Record<string, unknown>).referencia_producto;
      if (!ref || typeof ref !== "object") continue;
      const r = ref as Record<string, unknown>;
      const tipo = str(r.tipo) ?? "";
      const categoria = str(r.categoria);
      for (const c of mapearTipoReferenciaACategorias(tipo, categoria, ctx)) {
        cats.add(c);
      }
    }
  }

  const carrusel = pieza.carrusel;
  if (carrusel && typeof carrusel === "object") {
    const c = carrusel as Record<string, unknown>;
    const laminas = c.laminas;
    const tieneProductoVisible =
      Array.isArray(laminas) &&
      laminas.some(
        (l) =>
          l &&
          typeof l === "object" &&
          (l as Record<string, unknown>).producto_visible === true
      );

    if (tieneProductoVisible || str(c.producto_aparece_en)) {
      for (const cat of mapearTipoReferenciaACategorias("empaque", null, ctx)) {
        cats.add(cat);
      }
      const textoProducto = str(c.producto_aparece_en) ?? "";
      agregarCategoriasDesdeTexto(textoProducto, ctx, cats);
    }
  }

  const productoApareceEn = str(pieza.producto_aparece_en);
  if (productoApareceEn && str(pieza.tipo_salida) === "guion") {
    for (const cat of mapearTipoReferenciaACategorias("empaque", null, ctx)) {
      cats.add(cat);
    }
    agregarCategoriasDesdeTexto(productoApareceEn, ctx, cats);
  }

  return [...cats];
}

export function categoriasProductoDesdeTexto(
  textoProducto: string | null,
  ctx: ContextoFotosProducto
): CategoriaFoto[] {
  const cats = new Set<CategoriaFoto>();
  for (const c of mapearTipoReferenciaACategorias("empaque", null, ctx)) {
    cats.add(c);
  }
  if (textoProducto) {
    agregarCategoriasDesdeTexto(textoProducto, ctx, cats);
  }
  return [...cats];
}

export function categoriasDesdeReferenciaProducto(
  ref: Record<string, unknown>,
  ctx: ContextoFotosProducto
): CategoriaFoto[] {
  return mapearTipoReferenciaACategorias(
    str(ref.tipo) ?? "",
    str(ref.categoria),
    ctx
  );
}

export function extraerActorSugerido(pieza: Record<string, unknown>): string | null {
  const guion = pieza.guion;
  if (!guion || typeof guion !== "object") return null;
  return str((guion as Record<string, unknown>).actor_sugerido);
}

export function buscarActorPorNombre(
  nombre: string,
  actores: ActorRecurso[]
): ActorRecurso | null {
  const normalizado = nombre.trim().toLowerCase();
  if (!normalizado) return null;

  return (
    actores.find((a) => (a.nombre ?? "").trim().toLowerCase() === normalizado) ??
    actores.find((a) =>
      (a.nombre ?? "").trim().toLowerCase().includes(normalizado)
    ) ??
    null
  );
}

export function piezaNecesitaRecursosVisuales(
  pieza: Record<string, unknown>,
  ctx: ContextoFotosProducto
): boolean {
  if (extraerCategoriasReferenciadas(pieza, ctx).length > 0) return true;
  if (extraerActorSugerido(pieza)) return true;
  return false;
}
