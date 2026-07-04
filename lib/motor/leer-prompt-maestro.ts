import { existsSync, readFileSync } from "fs";
import path from "path";
import {
  resolverVersionPrompt,
  VERSION_PROMPT_POR_DEFECTO,
  versionPorId,
  type VersionPrompt,
} from "@/prompts/versiones";
import { createClient } from "@/lib/supabase/server";

export type FuentePromptMaestro = "base" | "archivo";

export type ResultadoPromptMaestro = {
  contenido: string;
  versionUsada: VersionPrompt;
  aviso?: string;
  fuente: FuentePromptMaestro;
};

type PromptDesdeBase = {
  id: string;
  nombre: string;
  contenido: string;
};

function debeLoguearFuente(): boolean {
  return (
    process.env.MAYA_LOG_PROMPT_FUENTE === "1" ||
    process.env.NODE_ENV === "development"
  );
}

function logFuente(
  versionId: string,
  fuente: FuentePromptMaestro,
  detalle?: string
) {
  if (!debeLoguearFuente()) return;
  const extra = detalle ? ` (${detalle})` : "";
  console.log(`[prompt-maestro] ${versionId} → leído de ${fuente}${extra}`);
}

function rutaArchivoPrompt(archivo: string): string {
  return path.join(process.cwd(), "prompts", archivo);
}

function leerArchivoVersion(version: VersionPrompt): string {
  const ruta = rutaArchivoPrompt(version.archivo);
  return readFileSync(ruta, "utf-8");
}

function versionDesdeBase(fila: PromptDesdeBase): VersionPrompt {
  return (
    versionPorId(fila.id) ?? {
      id: fila.id,
      nombre: fila.nombre,
      archivo: `prompt-maestro-${fila.id}.md`,
    }
  );
}

type ResultadoArchivo = {
  contenido: string;
  versionUsada: VersionPrompt;
  aviso?: string;
};

function leerDesdeArchivo(
  version: VersionPrompt,
  contexto?: {
    usoFallbackCatalogo: boolean;
    idSolicitado: string | null;
  }
): ResultadoArchivo {
  const archivoExiste = existsSync(rutaArchivoPrompt(version.archivo));
  let versionFinal = version;
  let aviso: string | undefined;

  if (!archivoExiste) {
    const fallback = resolverVersionPrompt(VERSION_PROMPT_POR_DEFECTO).version;
    if (!existsSync(rutaArchivoPrompt(fallback.archivo))) {
      throw new Error("No se encontró ningún archivo de prompt maestro.");
    }
    versionFinal = fallback;
    aviso = `El archivo del prompt ${version.archivo} no existe. Se usó ${fallback.id} (${fallback.nombre}).`;
  } else if (contexto?.usoFallbackCatalogo && contexto.idSolicitado) {
    aviso = `La versión "${contexto.idSolicitado}" no está disponible. Se usó ${versionFinal.id} (${versionFinal.nombre}).`;
  }

  return {
    contenido: leerArchivoVersion(versionFinal),
    versionUsada: versionFinal,
    aviso,
  };
}

async function leerDesdeBase(
  versionId: string
): Promise<PromptDesdeBase | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("prompts_maestros")
      .select("id, nombre, contenido")
      .eq("id", versionId)
      .maybeSingle();

    if (error) {
      return null;
    }

    const contenido = data?.contenido?.trim();
    if (!data?.id || !contenido) {
      return null;
    }

    return {
      id: data.id,
      nombre: data.nombre,
      contenido,
    };
  } catch {
    return null;
  }
}

export async function leerPromptMaestro(
  versionId?: string | null
): Promise<ResultadoPromptMaestro> {
  const idSolicitado = versionId?.trim() || null;

  if (idSolicitado) {
    const solicitadoEnBase = await leerDesdeBase(idSolicitado);
    if (solicitadoEnBase) {
      logFuente(idSolicitado, "base");
      return {
        contenido: solicitadoEnBase.contenido,
        versionUsada: versionDesdeBase(solicitadoEnBase),
        fuente: "base",
      };
    }
  }

  const { version, usoFallback } = resolverVersionPrompt(versionId);

  const desdeBase = await leerDesdeBase(version.id);
  if (desdeBase) {
    logFuente(version.id, "base");
    return {
      contenido: desdeBase.contenido,
      versionUsada: version,
      aviso:
        usoFallback && idSolicitado
          ? `La versión "${idSolicitado}" no está disponible. Se usó ${version.id} (${version.nombre}).`
          : undefined,
      fuente: "base",
    };
  }

  const motivoFallback = "no encontrado en base o error al leer";
  logFuente(version.id, "archivo", `fallback: ${motivoFallback}`);

  const desdeArchivo = leerDesdeArchivo(version, {
    usoFallbackCatalogo: usoFallback,
    idSolicitado,
  });

  const avisoFallback = `Prompt leído desde archivo (fallback): ${motivoFallback}.`;
  const aviso = [avisoFallback, desdeArchivo.aviso].filter(Boolean).join(" ");

  return {
    contenido: desdeArchivo.contenido,
    versionUsada: desdeArchivo.versionUsada,
    aviso: aviso || undefined,
    fuente: "archivo",
  };
}
