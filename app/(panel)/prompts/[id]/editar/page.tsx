import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { verificarAdminPagina } from "@/lib/auth/requiere-admin";
import { cargarPromptMaestroPorId } from "@/lib/prompts/prompts-maestros";
import { createClient } from "@/lib/supabase/server";
import { EditarPromptForm } from "./EditarPromptForm";

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { prompt } = await cargarPromptMaestroPorId(supabase, id);
  return {
    title: prompt
      ? `${prompt.es_editable ? "Editar" : "Ver"} — ${prompt.nombre} — Maya Studio`
      : "Prompt — Maya Studio",
  };
}

export default async function EditarPromptPage({ params }: PageProps) {
  await verificarAdminPagina();
  const { id } = await params;
  const supabase = await createClient();
  const { prompt, error } = await cargarPromptMaestroPorId(supabase, id);

  if (error) {
    return (
      <p className="text-sm text-danger" role="alert">
        No se pudo cargar el prompt: {error}
      </p>
    );
  }

  if (!prompt) {
    notFound();
  }

  return <EditarPromptForm prompt={prompt} />;
}
