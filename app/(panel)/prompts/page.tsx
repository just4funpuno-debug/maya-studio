import type { Metadata } from "next";
import { verificarAdminPagina } from "@/lib/auth/requiere-admin";
import { cargarListaPromptsMaestros } from "@/lib/prompts/prompts-maestros";
import { createClient } from "@/lib/supabase/server";
import { CrearPromptForm } from "./CrearPromptForm";
import { PromptsList } from "./PromptsList";

export const metadata: Metadata = {
  title: "Prompts — Maya Studio",
};

export default async function PromptsPage() {
  await verificarAdminPagina();
  const supabase = await createClient();
  const { prompts, error } = await cargarListaPromptsMaestros(supabase);

  return (
    <div className="flex flex-col gap-6">
      <div className="border-b border-panel-border pb-4">
        <h1 className="text-2xl font-semibold text-panel-text">Prompts</h1>
        <p className="mt-1 text-sm text-panel-text-muted">
          Biblioteca de prompts maestros para la generación de contenido.
        </p>
      </div>

      {error && (
        <p className="text-sm text-danger" role="alert">
          No se pudo cargar la lista: {error}
        </p>
      )}

      <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <div>
          <p className="mb-3 text-xs uppercase tracking-[0.05em] text-panel-text-muted">
            {prompts.length === 0
              ? "Sin prompts"
              : `${prompts.length} prompt${prompts.length === 1 ? "" : "s"}`}
          </p>
          {!error && <PromptsList prompts={prompts} />}
        </div>

        <div className="lg:sticky lg:top-8 lg:self-start">
          <CrearPromptForm />
        </div>
      </div>
    </div>
  );
}
