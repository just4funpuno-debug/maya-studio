"use client";

import {
  AlertTriangle,
  Clapperboard,
  FileText,
  Image as ImageIcon,
  LayoutGrid,
  MessageSquare,
  Mic,
  Type as TypeIcon,
  Video,
  Wrench,
} from "lucide-react";
import { CopyButton } from "./CopyButton";
import { LightboxProvider } from "./ImagenLightbox";
import {
  BloqueActorSugerido,
  BloqueReferenciaProducto,
} from "./RecursosVisualesInline";
import {
  categoriasProductoDesdeTexto,
  type RecursosGeneracion,
} from "@/lib/motor/fotos-contexto";

type PiezaVistaProps = {
  pieza: Record<string, unknown>;
  productoId: string;
  recursos: RecursosGeneracion;
};

type VistaRecursosProps = {
  productoId: string;
  recursos: RecursosGeneracion;
};

function str(val: unknown): string | null {
  return typeof val === "string" && val.trim() ? val.trim() : null;
}

/* ---------- Bloques de layout base ---------- */

function Section({
  title,
  icon,
  right,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  right?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-panel-border bg-[var(--surface-2)] p-6">
      <div className="mb-4 flex items-center gap-2">
        {icon && <span className="text-accent">{icon}</span>}
        <h3 className="text-[13px] font-semibold uppercase tracking-[0.05em] text-accent">
          {title}
        </h3>
        {right && <div className="ml-auto flex items-center gap-2">{right}</div>}
      </div>
      {children}
    </section>
  );
}

/* Campo compacto tipo "chip" para datos secundarios */
function ChipDato({ label, value }: { label: string; value: string | null }) {
  if (!value) return null;
  return (
    <div className="rounded-[10px] bg-[var(--surface-3)] p-3">
      <p className="text-[11px] text-panel-text-muted">{label}</p>
      <p className="mt-1 text-[13px] font-medium text-panel-text">{value}</p>
    </div>
  );
}

/* Campo destacado (hook, CTA, idea central) */
function CampoDestacado({
  label,
  value,
  tono = "neutro",
}: {
  label: string;
  value: string | null;
  tono?: "acento" | "neutro";
}) {
  if (!value) return null;
  const acento = tono === "acento";
  return (
    <div
      className={
        acento
          ? "rounded-xl border border-[rgba(245,158,11,0.2)] bg-[rgba(245,158,11,0.06)] p-4"
          : "rounded-xl border border-panel-border bg-[var(--surface-3)] p-4"
      }
    >
      <p className="mb-1 text-[11px] uppercase tracking-[0.04em] text-panel-text-muted">
        {label}
      </p>
      <p className="text-[15px] leading-relaxed text-panel-text">{value}</p>
    </div>
  );
}

/* Campo simple etiqueta+valor (para dentro de clips) */
function Campo({ label, value }: { label: string; value: string | null }) {
  if (!value) return null;
  return (
    <div>
      <p className="text-[11px] uppercase tracking-[0.04em] text-panel-text-muted">
        {label}
      </p>
      <p className="mt-0.5 text-[13px] leading-relaxed text-panel-text">{value}</p>
    </div>
  );
}

/* Prompt copiable, resaltado tipo "código", con color por tipo */
function PromptCopiable({
  label,
  value,
  color,
  icon,
}: {
  label: string;
  value: string | null;
  color: string;
  icon: React.ReactNode;
}) {
  if (!value) return null;
  return (
    <div className="rounded-[10px] border border-panel-border bg-panel-bg p-3">
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <span
          className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.04em]"
          style={{ color }}
        >
          {icon}
          {label}
        </span>
        <CopyButton text={value} />
      </div>
      <p className="font-mono text-[12.5px] leading-relaxed text-panel-text">
        {value}
      </p>
    </div>
  );
}

/* ---------- Vistas por tipo de salida ---------- */

function ClipsVista({
  clips,
  productoId,
  recursos,
}: { clips: unknown } & VistaRecursosProps) {
  const ctx = recursos.fotos;
  if (!Array.isArray(clips) || clips.length === 0) return null;
  return (
    <div className="space-y-3">
      {clips.map((clip, i) => {
        if (!clip || typeof clip !== "object") return null;
        const c = clip as Record<string, unknown>;
        const ref = c.referencia_producto;
        const tieneRef =
          ref !== null && ref !== undefined && typeof ref === "object";
        const numero = str(c.numero) ?? String(i + 1);
        const herramienta = str(c.herramienta_video);
        return (
          <div
            key={i}
            className="overflow-hidden rounded-2xl border border-[var(--border-strong)] bg-panel-surface"
          >
            {/* Encabezado del clip */}
            <div className="flex items-center gap-2.5 border-b border-panel-border bg-[var(--surface-3)] px-4 py-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-accent text-[13px] font-bold text-panel-sidebar">
                {numero}
              </span>
              <span className="text-sm font-semibold text-panel-text">
                Clip {numero}
              </span>
              {herramienta && (
                <span className="ml-auto flex items-center gap-1.5 rounded-md bg-accent-muted px-2.5 py-1 text-[11px] font-medium text-accent">
                  <Wrench className="h-3 w-3" aria-hidden />
                  {herramienta}
                </span>
              )}
            </div>
            {/* Cuerpo del clip */}
            <div className="space-y-3 p-4">
              <Campo label="Acción visual" value={str(c.accion_visual)} />
              <PromptCopiable
                label="Prompt imagen"
                value={str(c.prompt_imagen)}
                color="#38bdf8"
                icon={<ImageIcon className="h-3 w-3" aria-hidden />}
              />
              <PromptCopiable
                label="Prompt animación"
                value={str(c.prompt_animacion)}
                color="#a78bfa"
                icon={<Video className="h-3 w-3" aria-hidden />}
              />
              {(str(c.locucion) || str(c.texto_pantalla)) && (
                <div className="grid gap-3 sm:grid-cols-2">
                  {str(c.locucion) && (
                    <div className="rounded-[10px] bg-[var(--surface-3)] p-3">
                      <p className="mb-1 flex items-center gap-1.5 text-[11px] uppercase tracking-[0.04em] text-panel-text-muted">
                        <Mic className="h-3 w-3" aria-hidden />
                        Locución
                      </p>
                      <p className="text-[13px] leading-relaxed text-panel-text">
                        {str(c.locucion)}
                      </p>
                    </div>
                  )}
                  {str(c.texto_pantalla) && (
                    <div className="rounded-[10px] bg-[var(--surface-3)] p-3">
                      <p className="mb-1 flex items-center gap-1.5 text-[11px] uppercase tracking-[0.04em] text-panel-text-muted">
                        <TypeIcon className="h-3 w-3" aria-hidden />
                        Texto en pantalla
                      </p>
                      <p className="text-[13px] leading-relaxed text-panel-text">
                        {str(c.texto_pantalla)}
                      </p>
                    </div>
                  )}
                </div>
              )}
              {tieneRef && ref && typeof ref === "object" && (
                <BloqueReferenciaProducto
                  titulo="Referencia de producto en este clip"
                  ref={ref as Record<string, unknown>}
                  productoId={productoId}
                  ctx={ctx}
                />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function GuionVista({
  guion,
  productoApareceEn,
  productoId,
  recursos,
}: { guion: unknown; productoApareceEn: string | null } & VistaRecursosProps) {
  if (!guion || typeof guion !== "object") return null;
  const g = guion as Record<string, unknown>;
  const partes = g.partes;
  const ctx = recursos.fotos;
  const actorNombre = str(g.actor_sugerido);
  const categoriasProducto = productoApareceEn
    ? categoriasProductoDesdeTexto(productoApareceEn, ctx)
    : [];
  return (
    <div className="space-y-3">
      {g.marca_dramatizacion === true && (
        <div className="rounded-[10px] bg-[var(--surface-3)] p-3">
          <p className="text-[11px] uppercase tracking-[0.04em] text-panel-text-muted">
            Dramatización
          </p>
          <p className="mt-0.5 text-[13px] font-medium text-panel-text">
            Sí — mostrar aviso en pantalla
          </p>
        </div>
      )}
      {actorNombre && (
        <BloqueActorSugerido
          actorNombre={actorNombre}
          tipoActor={str(g.tipo_actor)}
          productoId={productoId}
          recursos={recursos}
        />
      )}
      {categoriasProducto.length > 0 && (
        <BloqueReferenciaProducto
          titulo="Referencia de producto en este guion"
          categorias={categoriasProducto}
          productoId={productoId}
          ctx={ctx}
        />
      )}
      {Array.isArray(partes) &&
        partes.map((parte, i) => {
          if (!parte || typeof parte !== "object") return null;
          const p = parte as Record<string, unknown>;
          return (
            <div
              key={i}
              className="overflow-hidden rounded-2xl border border-[var(--border-strong)] bg-panel-surface"
            >
              <div className="flex items-center gap-2.5 border-b border-panel-border bg-[var(--surface-3)] px-4 py-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-accent text-[13px] font-bold text-panel-sidebar">
                  {i + 1}
                </span>
                <span className="text-sm font-semibold text-panel-text">
                  Parte {i + 1}
                </span>
              </div>
              <div className="space-y-3 p-4">
                {str(p.parlamento) && (
                  <div className="rounded-[10px] border border-panel-border bg-panel-bg p-3">
                    <div className="mb-1.5 flex items-center justify-between gap-2">
                      <span className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.04em] text-accent">
                        <MessageSquare className="h-3 w-3" aria-hidden />
                        Parlamento
                      </span>
                      <CopyButton text={str(p.parlamento) as string} />
                    </div>
                    <p className="text-[13px] leading-relaxed text-panel-text">
                      {str(p.parlamento)}
                    </p>
                  </div>
                )}
                <div className="grid gap-3 sm:grid-cols-2">
                  <Campo label="Emoción / tono" value={str(p.emocion)} />
                  <Campo label="Acción física" value={str(p.accion)} />
                </div>
                <Campo label="Texto en pantalla" value={str(p.texto_pantalla)} />
              </div>
            </div>
          );
        })}
    </div>
  );
}

function CarruselVista({
  carrusel,
  productoId,
  recursos,
}: { carrusel: unknown } & VistaRecursosProps) {
  if (!carrusel || typeof carrusel !== "object") return null;
  const c = carrusel as Record<string, unknown>;
  const laminas = c.laminas;
  const ctx = recursos.fotos;
  const productoApareceEn = str(c.producto_aparece_en);
  const categoriasLamina = categoriasProductoDesdeTexto(productoApareceEn, ctx);
  return (
    <div className="space-y-3">
      <CampoDestacado
        label="Hook de portada"
        value={str(c.hook_portada)}
        tono="acento"
      />
      <div className="grid gap-3 sm:grid-cols-2">
        <ChipDato
          label="Cantidad de imágenes"
          value={
            typeof c.cantidad_imagenes === "number"
              ? String(c.cantidad_imagenes)
              : str(c.cantidad_imagenes)
          }
        />
        <ChipDato label="Producto aparece en" value={productoApareceEn} />
      </div>
      <PromptCopiable
        label="Prompt maestro (todas las imágenes)"
        value={str(c.prompt_maestro)}
        color="#38bdf8"
        icon={<ImageIcon className="h-3 w-3" aria-hidden />}
      />
      {Array.isArray(laminas) && (
        <div className="space-y-3">
          {laminas.map((lamina, i) => {
            if (!lamina || typeof lamina !== "object") return null;
            const l = lamina as Record<string, unknown>;
            const productoVisible = l.producto_visible === true;
            const numero = str(l.numero) ?? String(i + 1);
            const rol = str(l.rol);
            return (
              <div
                key={i}
                className="overflow-hidden rounded-2xl border border-[var(--border-strong)] bg-panel-surface"
              >
                <div className="flex items-center gap-2.5 border-b border-panel-border bg-[var(--surface-3)] px-4 py-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-accent text-[13px] font-bold text-panel-sidebar">
                    {numero}
                  </span>
                  <span className="text-sm font-semibold text-panel-text">
                    Lámina {numero}
                  </span>
                  {rol && (
                    <span className="ml-auto rounded-md bg-accent-muted px-2.5 py-1 text-[11px] font-medium text-accent">
                      {rol}
                    </span>
                  )}
                </div>
                <div className="space-y-3 p-4">
                  <Campo label="Texto" value={str(l.texto_corto)} />
                  {productoVisible && (
                    <BloqueReferenciaProducto
                      titulo="Referencia de producto en esta lámina"
                      categorias={categoriasLamina}
                      productoId={productoId}
                      ctx={ctx}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ---------- Captions ---------- */

function captionParaPanel(texto: string): string {
  return texto
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/\n{2,}/g, "\n")
    .trim();
}

const REDES: Record<string, { color: string; bg: string }> = {
  TikTok: { color: "#f8fafc", bg: "#25242b" },
  Instagram: { color: "#e1306c", bg: "rgba(225,48,108,0.10)" },
  Facebook: { color: "#38bdf8", bg: "rgba(56,189,248,0.10)" },
};

function CaptionBlock({ red, texto }: { red: string; texto: string }) {
  const textoNormalizado = captionParaPanel(texto);
  const lineas = textoNormalizado.split("\n");
  const estilo = REDES[red] ?? { color: "#f8fafc", bg: "var(--surface-3)" };
  return (
    <div className="overflow-hidden rounded-2xl border border-panel-border bg-panel-surface">
      <div
        className="flex items-center justify-between gap-2 border-b border-panel-border px-4 py-2.5"
        style={{ background: estilo.bg }}
      >
        <p
          className="text-sm font-semibold"
          style={{ color: estilo.color }}
        >
          {red}
        </p>
        <CopyButton text={textoNormalizado} />
      </div>
      <div className="px-4 py-3 text-[13px] leading-relaxed text-panel-text">
        {lineas.map((linea, i) => (
          <span key={i} className="block">
            {linea || "\u00A0"}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ---------- Componente principal ---------- */

export function PiezaVista({ pieza, productoId, recursos }: PiezaVistaProps) {
  const tipoSalida = str(pieza.tipo_salida);
  const estructura =
    pieza.estructura && typeof pieza.estructura === "object"
      ? (pieza.estructura as Record<string, unknown>)
      : null;
  const captions =
    pieza.captions && typeof pieza.captions === "object"
      ? (pieza.captions as Record<string, unknown>)
      : null;
  const avisos = Array.isArray(pieza.avisos)
    ? pieza.avisos.filter((a): a is string => typeof a === "string" && !!a.trim())
    : [];
  const vistaRecursos = { productoId, recursos };

  const diaCiclo =
    pieza.dia != null && pieza.ciclo != null
      ? `Día ${pieza.dia} · Ciclo ${pieza.ciclo}`
      : null;

  return (
    <LightboxProvider>
      <div className="space-y-4">
        {/* DATOS BASE */}
        <Section title="Datos base" icon={<FileText className="h-[18px] w-[18px]" aria-hidden />}>
          <div className="space-y-3">
            {/* Hook e Idea central destacados */}
            <CampoDestacado label="Hook — con qué abre" value={str(pieza.hook)} tono="acento" />
            <CampoDestacado label="Idea central" value={str(pieza.idea_central)} />

            {/* Datos secundarios en chips */}
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
              <ChipDato label="Formato" value={str(pieza.formato)} />
              <ChipDato label="Tipo de contenido" value={str(pieza.tipo_contenido)} />
              <ChipDato label="Objetivo" value={str(pieza.objetivo)} />
              <ChipDato label="Emoción" value={str(pieza.emocion)} />
              <ChipDato label="Tipo de salida" value={tipoSalida} />
              <ChipDato label="Producto aparece en" value={str(pieza.producto_aparece_en)} />
              <ChipDato label="Clasificación" value={str(pieza.clasificacion)} />
              <ChipDato label="Día / Ciclo" value={diaCiclo} />
            </div>

            <Campo label="Keyword SEO" value={str(pieza.keyword_seo)} />

            {/* CTA destacado */}
            <CampoDestacado label="CTA — llamado a la acción" value={str(pieza.cta)} />
          </div>
        </Section>

        {/* ESTRUCTURA DEL VIDEO (prompts) */}
        {tipoSalida === "prompts" && pieza.clips != null ? (
          <Section
            title="Estructura del video"
            icon={<Clapperboard className="h-[18px] w-[18px]" aria-hidden />}
            right={
              estructura ? (
                <>
                  {str(estructura.duracion_estimada) && (
                    <span className="rounded-full bg-[var(--surface-3)] px-2.5 py-1 text-[11px] text-panel-text-muted">
                      {str(estructura.duracion_estimada)}
                    </span>
                  )}
                  {typeof estructura.cantidad_clips === "number" && (
                    <span className="rounded-full bg-[var(--surface-3)] px-2.5 py-1 text-[11px] text-panel-text-muted">
                      {estructura.cantidad_clips} clips
                    </span>
                  )}
                </>
              ) : null
            }
          >
            <div className="space-y-3">
              {estructura && (
                <div className="grid gap-3 sm:grid-cols-2">
                  <Campo label="Música" value={str(estructura.musica)} />
                  <Campo label="Ritmo" value={str(estructura.ritmo)} />
                  <div className="sm:col-span-2">
                    <Campo label="Loop" value={str(estructura.loop)} />
                  </div>
                </div>
              )}
              <ClipsVista clips={pieza.clips} {...vistaRecursos} />
            </div>
          </Section>
        ) : null}

        {/* GUION */}
        {tipoSalida === "guion" && pieza.guion != null ? (
          <Section title="Guion" icon={<MessageSquare className="h-[18px] w-[18px]" aria-hidden />}>
            <GuionVista
              guion={pieza.guion}
              productoApareceEn={str(pieza.producto_aparece_en)}
              {...vistaRecursos}
            />
          </Section>
        ) : null}

        {/* CARRUSEL */}
        {tipoSalida === "carrusel" && pieza.carrusel != null ? (
          <Section title="Carrusel" icon={<LayoutGrid className="h-[18px] w-[18px]" aria-hidden />}>
            <CarruselVista carrusel={pieza.carrusel} {...vistaRecursos} />
          </Section>
        ) : null}

        {/* CAPTIONS */}
        {captions && (
          <Section title="Captions por red" icon={<MessageSquare className="h-[18px] w-[18px]" aria-hidden />}>
            <div className="space-y-3">
              {str(captions.tiktok) && (
                <CaptionBlock red="TikTok" texto={captions.tiktok as string} />
              )}
              {str(captions.instagram) && (
                <CaptionBlock red="Instagram" texto={captions.instagram as string} />
              )}
              {str(captions.facebook) && (
                <CaptionBlock red="Facebook" texto={captions.facebook as string} />
              )}
            </div>
          </Section>
        )}

        {/* AVISOS */}
        {avisos.length > 0 && (
          <section className="rounded-2xl border border-[rgba(245,158,11,0.4)] bg-accent-muted p-5">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-accent">
              <AlertTriangle className="h-4 w-4" aria-hidden />
              Avisos
            </h3>
            <ul className="space-y-2">
              {avisos.map((aviso, i) => (
                <li key={i} className="flex items-start gap-2 text-[13px] text-panel-text">
                  <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" aria-hidden />
                  <span>{aviso}</span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </LightboxProvider>
  );
}
