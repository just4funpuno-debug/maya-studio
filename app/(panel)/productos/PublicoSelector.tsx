"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { actualizarPublico } from "./actions";
import type { PublicoProducto } from "./actions";

type Props = {
  productoId: string;
  valorInicial: PublicoProducto;
};

const OPCIONES: { valor: PublicoProducto; etiqueta: string }[] = [
  { valor: "unisex", etiqueta: "Unisex" },
  { valor: "hombres", etiqueta: "Hombres" },
  { valor: "mujeres", etiqueta: "Mujeres" },
];

export function PublicoSelector({ productoId, valorInicial }: Props) {
  const router = useRouter();
  const [valor, setValor] = useState<PublicoProducto>(valorInicial);
  const [guardando, setGuardando] = useState(false);

  async function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const nuevo = e.target.value as PublicoProducto;
    const anterior = valor;
    setValor(nuevo);
    setGuardando(true);

    const result = await actualizarPublico(productoId, nuevo);
    if (!result.ok) {
      setValor(anterior);
    } else {
      router.refresh();
    }
    setGuardando(false);
  }

  return (
    <select
      value={valor}
      onChange={handleChange}
      disabled={guardando}
      aria-label="Público objetivo"
      className="cursor-pointer appearance-none rounded-md border border-panel-border bg-panel-bg px-2 py-0.5 text-[11px] text-panel-text-muted transition-colors hover:border-accent focus:border-accent focus:outline-none disabled:opacity-50"
    >
      {OPCIONES.map((op) => (
        <option
          key={op.valor}
          value={op.valor}
          style={{ backgroundColor: "#1a1f2e", color: "#cbd5e1" }}
        >
          {op.etiqueta}
        </option>
      ))}
    </select>
  );
}
