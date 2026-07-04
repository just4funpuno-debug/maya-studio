import { Package } from "lucide-react";

type ProductoMiniaturaProps = {
  nombre: string;
  imagenUrl: string | null;
  size?: "sm" | "md" | "lg";
};

function inicialesDeNombre(nombre: string): string {
  const palabras = nombre.trim().split(/\s+/).filter(Boolean);
  if (palabras.length === 0) return "?";
  if (palabras.length === 1) return palabras[0].slice(0, 2).toUpperCase();
  return (palabras[0][0] + palabras[1][0]).toUpperCase();
}

export function ProductoMiniatura({
  nombre,
  imagenUrl,
  size = "md",
}: ProductoMiniaturaProps) {
  const iniciales = inicialesDeNombre(nombre);

  const sizeClass =
    size === "sm"
      ? "h-10 w-10 rounded-lg"
      : size === "lg"
        ? "h-[180px] w-[180px] rounded-xl"
        : "h-14 w-14 rounded-lg";

  const iconClass =
    size === "lg" ? "h-12 w-12" : size === "sm" ? "h-4 w-4" : "h-4 w-4";
  const inicialesClass = size === "lg" ? "text-lg" : "text-[10px]";

  return (
    <div
      className={`flex shrink-0 items-center justify-center overflow-hidden border border-panel-border bg-panel-bg ${sizeClass}`}
      aria-hidden
    >
      {imagenUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={imagenUrl} alt="" className="h-full w-full object-cover" />
      ) : (
        <span className="flex flex-col items-center gap-0.5 text-panel-text-muted">
          <Package className={`${iconClass} opacity-60`} strokeWidth={1.5} />
          <span
            className={`${inicialesClass} font-semibold leading-none tracking-wide`}
          >
            {iniciales}
          </span>
        </span>
      )}
    </div>
  );
}
