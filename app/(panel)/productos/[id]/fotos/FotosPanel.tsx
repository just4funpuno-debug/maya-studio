"use client";

import { useState } from "react";
import {
  CATEGORIAS_FOTO,
  CategoriaFoto,
} from "@/lib/storage/productos";
import { ConfigFotosToggles } from "./ConfigFotosToggles";
import { FotoPerfilSection } from "./FotoPerfilSection";
import { FotoProducto, SeccionFotosCategoria } from "./SeccionFotosCategoria";

type FotosPanelProps = {
  productoId: string;
  fotoPerfilUrl: string | null;
  activoPorCategoria: Record<CategoriaFoto, boolean>;
  fotosPorCategoria: Record<CategoriaFoto, FotoProducto[]>;
};

export function FotosPanel({
  productoId,
  fotoPerfilUrl,
  activoPorCategoria: activoInicial,
  fotosPorCategoria,
}: FotosPanelProps) {
  const [activoPorCategoria, setActivoPorCategoria] = useState(activoInicial);

  function handleToggle(categoria: CategoriaFoto, activo: boolean) {
    setActivoPorCategoria((prev) => ({ ...prev, [categoria]: activo }));
  }

  const hayCategoriaActiva = CATEGORIAS_FOTO.some(
    (c) => activoPorCategoria[c]
  );

  return (
    <div className="flex flex-col gap-8">
      <FotoPerfilSection productoId={productoId} fotoPerfilUrl={fotoPerfilUrl} />

      <div className="border-t border-panel-border pt-6">
        <div className="mb-4 flex items-center gap-2">
          <span className="h-4 w-1 rounded-full bg-accent" aria-hidden />
          <h2 className="text-sm font-semibold text-panel-text">
            Fotos de trabajo
          </h2>
        </div>
        <p className="mb-5 text-xs text-panel-text-muted">
          Estas fotos las usa el motor para generar prompts y referencias visuales.
        </p>

        <div className="flex flex-col gap-8">
          <ConfigFotosToggles
            productoId={productoId}
            activoPorCategoria={activoPorCategoria}
            onToggle={handleToggle}
          />

          {!hayCategoriaActiva && (
            <p className="rounded-lg border border-dashed border-panel-border px-4 py-8 text-center text-panel-text-muted">
              Activa al menos una categoría para subir fotos del producto.
            </p>
          )}

          {hayCategoriaActiva && (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              {CATEGORIAS_FOTO.filter((c) => activoPorCategoria[c]).map((categoria) => (
                <SeccionFotosCategoria
                  key={categoria}
                  productoId={productoId}
                  categoria={categoria}
                  fotos={fotosPorCategoria[categoria]}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
