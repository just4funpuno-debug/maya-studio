import type { Metadata } from "next";
import { verificarAdminPagina } from "@/lib/auth/requiere-admin";
import { createClient } from "@/lib/supabase/server";
import { cargarAnalisisTipos } from "@/lib/metricas/cargar-analisis-tipos";
import { AnalisisRanking } from "./AnalisisRanking";

export const metadata: Metadata = {
  title: "Análisis — Maya Studio",
};

export default async function AnalisisPage() {
  await verificarAdminPagina();
  const supabase = await createClient();
  const { datos, error } = await cargarAnalisisTipos(supabase);

  return (
    <div className="flex flex-col gap-6">
      <div className="border-b border-panel-border pb-4">
        <h1 className="text-2xl font-semibold text-panel-text">
          Análisis de contenido
        </h1>
        <p className="mt-1 text-sm text-panel-text-muted">
          Qué tipos llegan más lejos en cada red · promedio de metas alcanzadas
        </p>
      </div>

      {error && (
        <p className="text-sm text-danger" role="alert">
          No se pudo cargar el análisis: {error}
        </p>
      )}

      <AnalisisRanking datos={datos} />
    </div>
  );
}
