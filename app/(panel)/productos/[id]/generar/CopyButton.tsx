"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

type CopyButtonProps = {
  text: string;
  label?: string;
};

export function CopyButton({ text, label = "Copiar" }: CopyButtonProps) {
  const [copiado, setCopiado] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      setCopiado(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex items-center gap-1.5 rounded-md border border-panel-border px-2 py-1 text-xs font-medium text-panel-text-muted transition-colors hover:border-accent/50 hover:text-accent"
    >
      {copiado ? (
        <>
          <Check className="h-3.5 w-3.5 text-success" aria-hidden />
          Copiado
        </>
      ) : (
        <>
          <Copy className="h-3.5 w-3.5" aria-hidden />
          {label}
        </>
      )}
    </button>
  );
}
