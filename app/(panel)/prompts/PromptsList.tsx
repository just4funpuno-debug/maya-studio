import Link from "next/link";
import { Eye, Lock, Pencil } from "lucide-react";
import type { PromptMaestroListado } from "@/lib/prompts/prompts-maestros";

type PromptsListProps = {
  prompts: PromptMaestroListado[];
};

export function PromptsList({ prompts }: PromptsListProps) {
  if (prompts.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-panel-border px-4 py-10 text-center text-sm text-panel-text-muted">
        Aún no hay prompts en la biblioteca. Crea el primero con el formulario.
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {prompts.map((prompt) => {
        const esSistema = !prompt.es_editable;
        return (
          <li
            key={prompt.id}
            className="rounded-2xl border border-panel-border bg-[var(--surface-2)] p-4 transition-colors hover:border-[var(--border-strong)]"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-[15px] font-medium text-panel-text">
                    {prompt.nombre}
                  </p>
                  <span className="rounded-md bg-[var(--surface-3)] px-2 py-0.5 font-mono text-[11px] text-panel-text-muted">
                    {prompt.id}
                  </span>
                  {esSistema && (
                    <span className="inline-flex items-center gap-1 rounded-md bg-[var(--surface-3)] px-2 py-0.5 text-[11px] text-panel-text-muted">
                      <Lock className="h-3 w-3" aria-hidden />
                      Sistema
                    </span>
                  )}
                </div>
                {prompt.descripcion && (
                  <p className="mt-1.5 text-xs text-panel-text-muted">
                    {prompt.descripcion}
                  </p>
                )}
              </div>

              <Link
                href={`/prompts/${encodeURIComponent(prompt.id)}/editar`}
                className={`flex shrink-0 items-center gap-1.5 rounded-[9px] px-3 py-1.5 text-xs font-medium transition-colors ${
                  esSistema
                    ? "border border-[var(--border-strong)] text-panel-text-muted hover:border-panel-border hover:bg-[var(--surface-3)]"
                    : "border border-accent/40 text-accent hover:border-accent/60 hover:bg-accent-muted"
                }`}
              >
                {esSistema ? (
                  <>
                    <Eye className="h-3.5 w-3.5" aria-hidden />
                    Ver
                  </>
                ) : (
                  <>
                    <Pencil className="h-3.5 w-3.5" aria-hidden />
                    Editar
                  </>
                )}
              </Link>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
