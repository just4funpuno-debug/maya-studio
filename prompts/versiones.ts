export type VersionPrompt = {
  id: string;
  archivo: string;
  nombre: string;
  descripcion?: string;
};

export const VERSIONES_PROMPT: VersionPrompt[] = [
  {
    id: "v1.0",
    archivo: "prompt-maestro-v1.0.md",
    nombre: "Versión 1.0 (original)",
    descripcion: "Primera versión afinada para producción.",
  },
  {
    id: "v1.1",
    archivo: "prompt-maestro-v1.1.md",
    nombre: "Versión 1.1",
    descripcion:
      "Captions, ortografía, claims médicos de presión y transformaciones.",
  },
];

export const VERSION_PROMPT_POR_DEFECTO = "v1.1";

export function versionPorId(id: string): VersionPrompt | undefined {
  return VERSIONES_PROMPT.find((v) => v.id === id);
}

export function etiquetaVersion(id: string): string {
  return versionPorId(id)?.nombre ?? id;
}

export function resolverVersionPrompt(id: string | null | undefined): {
  version: VersionPrompt;
  usoFallback: boolean;
  idSolicitado: string | null;
} {
  const idSolicitado = id?.trim() || null;
  const versionCatalogo = idSolicitado ? versionPorId(idSolicitado) : undefined;
  const version =
    versionCatalogo ?? versionPorId(VERSION_PROMPT_POR_DEFECTO)!;

  return {
    version,
    usoFallback: !versionCatalogo || versionCatalogo.id !== idSolicitado,
    idSolicitado,
  };
}
