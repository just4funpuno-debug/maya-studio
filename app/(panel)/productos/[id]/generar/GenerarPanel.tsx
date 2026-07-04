"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Loader2,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { aprobarPiezaAction, generarPiezaAction } from "./actions";
import { PiezaVista } from "./PiezaVista";
import type { RecursosGeneracion } from "@/lib/motor/fotos-contexto";

type GenerarPanelProps = {
  productoId: string;
  diaActual: number;
  cicloActual: number;
  recursos: RecursosGeneracion;
};

type Estado = "inicial" | "cargando" | "pieza" | "aprobado" | "error";

const DIAS_POR_CICLO = 31;

export function GenerarPanel({
  productoId,
  diaActual: diaInicial,
  cicloActual: cicloInicial,
  recursos,
}: GenerarPanelProps) {
  const router = useRouter();
  const [estado, setEstado] = useState<Estado>("inicial");
  const [diaActual, setDiaActual] = useState(diaInicial);
  const [cicloActual, setCicloActual] = useState(cicloInicial);
  const [pieza, setPieza] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [errorRaw, setErrorRaw] = useState<string | null>(null);
  const [errorParse, setErrorParse] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [mensajeAprobado, setMensajeAprobado] = useState<string | null>(null);
  const [avisoMotor, setAvisoMotor] = useState<string | null>(null);

  async function ejecutarGeneracion() {
    setEstado("cargando");
    setError(null);
    setErrorRaw(null);
    setErrorParse(null);
    setMensajeAprobado(null);
    setAvisoMotor(null);
    const result = await generarPiezaAction(productoId);
    if (!result.ok) {
      setError(result.error);
      setErrorRaw(result.raw ?? null);
      setErrorParse(result.parseError ?? null);
      setEstado("error");
      return;
    }
    setPieza(result.pieza);
    setAvisoMotor(result.avisoMotor ?? null);
    setEstado("pieza");
  }

  async function handleAprobar() {
    if (!pieza) return;
    setGuardando(true);
    setError(null);
    const result = await aprobarPiezaAction(productoId, pieza);
    if (!result.ok) {
      setError(result.error);
      setGuardando(false);
      return;
    }
    setDiaActual(result.nuevoDia);
    setCicloActual(result.nuevoCiclo);
    setMensajeAprobado(
      result.cambioCiclo && result.cicloCompletado != null
        ? `¡Completaste el Ciclo ${result.cicloCompletado}! Ahora empieza el Ciclo ${result.nuevoCiclo}, Día 1. La estrategia de contenido se ajusta a esta nueva etapa.`
        : `Pieza guardada correctamente. Ahora toca el día ${result.nuevoDia}.`
    );
    setPieza(null);
    setEstado("aprobado");
    setGuardando(false);
    router.refresh();
  }

  const progresoCiclo = Math.round((diaActual / DIAS_POR_CICLO) * 100);

  return (
    <div className="space-y-5">
      {/* HOY TOCA con progreso del ciclo */}
      <div
        className="relative overflow-hidden rounded-2xl border border-[rgba(245,158,11,0.3)] p-6"
        style={{
          background:
            "radial-gradient(circle at top right, rgba(245,158,11,0.12), transparent 55%), linear-gradient(135deg, #1f1a10 0%, #171310 100%)",
        }}
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-accent">
              Hoy toca
            </p>
            <p className="text-[28px] font-semibold tracking-tight text-panel-text">
              Día {diaActual}{" "}
              <span className="text-panel-text-muted">· Ciclo {cicloActual}</span>
            </p>
          </div>
          <div className="text-right">
            <p className="mb-1.5 text-[11px] text-panel-text-muted">
              Progreso del ciclo
            </p>
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-28 overflow-hidden rounded-full bg-[var(--surface-3)]">
                <div
                  className="h-full rounded-full bg-accent transition-all duration-500"
                  style={{ width: `${progresoCiclo}%` }}
                />
              </div>
              <span className="text-xs text-panel-text-muted">
                {diaActual}/{DIAS_POR_CICLO}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Mensaje de aprobado / cambio de ciclo */}
      {mensajeAprobado && (
        <div
          className="flex items-center gap-2.5 rounded-xl border border-[rgba(34,197,94,0.4)] bg-[rgba(34,197,94,0.08)] px-4 py-3.5 text-sm text-success"
          role="status"
        >
          <CheckCircle2 className="h-5 w-5 shrink-0" aria-hidden />
          <span>{mensajeAprobado}</span>
        </div>
      )}

      {/* Botón Generar (estados inicial/aprobado/error) */}
      {(estado === "inicial" || estado === "aprobado" || estado === "error") && (
        <button
          type="button"
          onClick={ejecutarGeneracion}
          className="flex w-full items-center justify-center gap-2.5 rounded-2xl bg-accent px-6 py-4 text-[15px] font-bold text-panel-sidebar shadow-[0_4px_16px_rgba(245,158,11,0.3)] transition-all duration-150 hover:-translate-y-0.5 hover:bg-accent-strong hover:shadow-[0_6px_22px_rgba(245,158,11,0.4)]"
        >
          <Sparkles className="h-5 w-5" aria-hidden />
          Generar contenido
        </button>
      )}

      {/* Estado cargando */}
      {estado === "cargando" && (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-panel-border bg-panel-surface py-14">
          <Loader2 className="h-8 w-8 animate-spin text-accent" aria-hidden />
          <p className="text-sm text-panel-text-muted">
            Generando contenido... esto puede tardar unos segundos
          </p>
        </div>
      )}

      {/* Estado error */}
      {error && (
        <div className="space-y-3 rounded-2xl border border-[rgba(239,68,68,0.4)] bg-[rgba(239,68,68,0.08)] p-4">
          <p className="flex items-center gap-2 text-sm text-danger" role="alert">
            <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden />
            {error}
          </p>
          {errorParse && (
            <p className="text-xs text-panel-text-muted">
              Detalle del parseo: {errorParse}
            </p>
          )}
          {errorRaw && (
            <details className="text-xs text-panel-text-muted">
              <summary className="cursor-pointer hover:text-panel-text">
                Ver respuesta cruda
              </summary>
              <pre className="mt-2 max-h-48 overflow-auto whitespace-pre-wrap rounded-lg bg-panel-bg p-3">
                {errorRaw}
              </pre>
            </details>
          )}
        </div>
      )}

      {/* Pieza generada + acciones */}
      {estado === "pieza" && pieza && (
        <div className="space-y-5">
          {avisoMotor && (
            <div
              className="flex items-center gap-2.5 rounded-xl border border-[rgba(245,158,11,0.5)] bg-accent-muted px-4 py-3.5 text-sm text-accent"
              role="status"
            >
              <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden />
              <span>{avisoMotor}</span>
            </div>
          )}
          <PiezaVista pieza={pieza} productoId={productoId} recursos={recursos} />
          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={handleAprobar}
              disabled={guardando}
              className="flex flex-[2] items-center justify-center gap-2 rounded-xl bg-success px-4 py-3.5 text-sm font-bold text-panel-sidebar shadow-[0_4px_14px_rgba(34,197,94,0.25)] transition-all duration-150 hover:-translate-y-0.5 hover:bg-green-400 disabled:translate-y-0 disabled:opacity-50 disabled:shadow-none"
            >
              {guardando ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  Guardando...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-[18px] w-[18px]" aria-hidden />
                  Aprobar y guardar
                </>
              )}
            </button>
            <button
              type="button"
              onClick={ejecutarGeneracion}
              disabled={guardando}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-[var(--border-strong)] px-4 py-3.5 text-sm font-medium text-panel-text transition-colors duration-150 hover:border-accent/50 hover:text-accent disabled:opacity-50"
            >
              <RefreshCw className="h-4 w-4" aria-hidden />
              Regenerar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
