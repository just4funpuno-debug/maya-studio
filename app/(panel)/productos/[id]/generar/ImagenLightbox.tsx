"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { Download, X } from "lucide-react";

type LightboxState = {
  imagenUrl: string;
  titulo: string;
  nombreArchivo?: string;
};

type LightboxContextValue = {
  abrir: (opts: LightboxState) => void;
  cerrar: () => void;
};

const LightboxContext = createContext<LightboxContextValue | null>(null);

export function useLightbox(): LightboxContextValue {
  const ctx = useContext(LightboxContext);
  if (!ctx) {
    throw new Error("useLightbox debe usarse dentro de LightboxProvider");
  }
  return ctx;
}

function extensionDesdeUrl(url: string): string {
  try {
    const pathname = new URL(url).pathname;
    const ext = pathname.split(".").pop()?.toLowerCase();
    if (ext && ["jpg", "jpeg", "png", "webp", "gif"].includes(ext)) {
      return ext === "jpeg" ? "jpg" : ext;
    }
  } catch {
    /* ignore */
  }
  return "jpg";
}

function nombreArchivoSeguro(base: string, url: string): string {
  const slug = base
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
  return `${slug || "imagen"}.${extensionDesdeUrl(url)}`;
}

async function obtenerBlob(imagenUrl: string): Promise<Blob> {
  const res = await fetch(imagenUrl);
  if (!res.ok) {
    throw new Error("No se pudo obtener la imagen.");
  }
  return res.blob();
}

function LightboxModal({
  state,
  onCerrar,
}: {
  state: LightboxState;
  onCerrar: () => void;
}) {
  const [descargando, setDescargando] = useState(false);
  const [errorDescarga, setErrorDescarga] = useState<string | null>(null);

  const nombreDescarga = nombreArchivoSeguro(
    state.nombreArchivo ?? state.titulo,
    state.imagenUrl
  );

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onCerrar();
    }
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [onCerrar]);

  async function handleDescargar() {
    setDescargando(true);
    setErrorDescarga(null);
    try {
      const blob = await obtenerBlob(state.imagenUrl);
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objectUrl;
      a.download = nombreDescarga;
      a.click();
      URL.revokeObjectURL(objectUrl);
    } catch {
      setErrorDescarga("No se pudo descargar la imagen. Intenta de nuevo.");
    } finally {
      setDescargando(false);
    }
  }

  function handleOverlayClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onCerrar();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/80 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={state.titulo}
      onClick={handleOverlayClick}
    >
      <button
        type="button"
        onClick={onCerrar}
        className="absolute right-4 top-4 rounded-md border border-panel-border bg-panel-sidebar/90 p-2 text-panel-text-muted transition-colors hover:border-accent/50 hover:text-accent"
        aria-label="Cerrar"
      >
        <X className="h-5 w-5" aria-hidden />
      </button>

      <div
        className="flex max-h-full max-w-full flex-col items-center gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={state.imagenUrl}
          alt={state.titulo}
          className="max-h-[75vh] max-w-[90vw] object-contain"
        />

        <p className="text-center text-sm font-medium text-white">{state.titulo}</p>

        <p className="max-w-md text-center text-xs text-panel-text-muted">
          💡 Para copiar: clic derecho sobre la imagen → Copiar imagen. O usa
          Descargar.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            onClick={handleDescargar}
            disabled={descargando}
            className="inline-flex items-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-medium text-panel-sidebar transition-colors hover:bg-accent-strong disabled:opacity-50"
          >
            <Download className="h-4 w-4" aria-hidden />
            {descargando ? "Descargando..." : "Descargar"}
          </button>

          <button
            type="button"
            onClick={onCerrar}
            className="inline-flex items-center gap-2 rounded-md border border-panel-border bg-panel-sidebar/90 px-4 py-2 text-sm font-medium text-panel-text-muted transition-colors hover:border-accent/50 hover:text-accent"
          >
            Cerrar
          </button>
        </div>

        {errorDescarga && (
          <p className="max-w-md text-center text-sm text-amber-300" role="alert">
            {errorDescarga}
          </p>
        )}
      </div>
    </div>
  );
}

export function LightboxProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<LightboxState | null>(null);

  const abrir = useCallback((opts: LightboxState) => {
    setState(opts);
  }, []);

  const cerrar = useCallback(() => {
    setState(null);
  }, []);

  return (
    <LightboxContext.Provider value={{ abrir, cerrar }}>
      {children}
      {state && <LightboxModal state={state} onCerrar={cerrar} />}
    </LightboxContext.Provider>
  );
}
