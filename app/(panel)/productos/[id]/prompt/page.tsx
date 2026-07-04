import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { verificarAdminPagina } from "@/lib/auth/requiere-admin";
import { createClient } from "@/lib/supabase/server";
import { etiquetaModelo, modeloPorId } from "@/lib/motor/modelos";
import {
  asegurarPromptEnLista,
  cargarListaPromptsMaestros,
  mapaEtiquetasPrompts,
  resolverEtiquetaPrompt,
} from "@/lib/prompts/prompts-maestros";
import { ModeloIaSelector } from "./ModeloIaSelector";
import { VersionPromptSelector } from "./VersionPromptSelector";

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data: producto } = await supabase
    .from("productos")
    .select("nombre")
    .eq("id", id)
    .maybeSingle();
  return {
    title: producto
      ? `Motor — ${producto.nombre} — Maya Studio`
      : "Motor — Maya Studio",
  };
}

export default async function ProductoPromptPage({ params }: PageProps) {
  await verificarAdminPagina();
  const { id } = await params;
  const supabase = await createClient();
  const { data: producto, error } = await supabase
    .from("productos")
    .select("id, nombre, version_prompt, modelo_ia")
    .eq("id", id)
    .maybeSingle();
  if (error || !producto) {
    notFound();
  }

  const versionActual = producto.version_prompt ?? "v1.1";
  const modeloActual = producto.modelo_ia ?? "claude-haiku-4-5";
  const modeloInfo = modeloPorId(modeloActual);

  const { prompts: promptsBiblioteca } = await cargarListaPromptsMaestros(supabase);
  const promptsParaSelector = asegurarPromptEnLista(
    promptsBiblioteca,
    versionActual
  );
  const etiquetaPrompt = resolverEtiquetaPrompt(
    versionActual,
    mapaEtiquetasPrompts(promptsBiblioteca)
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="border-b border-panel-border pb-4">
        <Link
          href="/productos"
          className="mb-2.5 inline-flex items-center gap-1 text-sm text-panel-text-muted transition-colors hover:text-accent"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Volver a productos
        </Link>
        <h1 className="text-2xl font-semibold text-panel-text">
          {producto.nombre}
        </h1>
        <p className="mt-1 text-sm text-panel-text-muted">
          Configuración del motor de generación
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          <span className="rounded-md bg-[var(--surface-3)] px-2.5 py-1 text-xs text-panel-text-muted">
            Prompt: {etiquetaPrompt}
          </span>
          <span className="rounded-md bg-[var(--surface-3)] px-2.5 py-1 text-xs text-panel-text-muted">
            Modelo: {modeloInfo ? etiquetaModelo(modeloActual) : modeloActual}
          </span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <VersionPromptSelector
          productoId={producto.id}
          versionActual={versionActual}
          prompts={promptsParaSelector}
        />
        <ModeloIaSelector
          productoId={producto.id}
          modeloActual={modeloActual}
        />
      </div>
    </div>
  );
}
