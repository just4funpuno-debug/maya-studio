type UsuarioSidebarProps = {
  nombre: string | null;
  rolEtiqueta: string | null;
};

export function UsuarioSidebar({ nombre, rolEtiqueta }: UsuarioSidebarProps) {
  if (!nombre || !rolEtiqueta) {
    return (
      <div className="border-t border-panel-border px-4 py-3">
        <p className="text-sm text-panel-text-muted">Sesión activa</p>
      </div>
    );
  }

  return (
    <div className="border-t border-panel-border px-4 py-3">
      <p className="truncate text-sm font-medium text-panel-text">{nombre}</p>
      <p className="text-xs text-accent/90">{rolEtiqueta}</p>
    </div>
  );
}
