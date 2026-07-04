import { Sidebar } from "@/components/panel/Sidebar";
import { perfilParaSidebar } from "@/lib/auth/perfil";
import { esAdmin } from "@/lib/auth/requiere-admin";
import { obtenerUsuarioActual } from "@/lib/auth/usuario-actual";

export default async function PanelLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const usuario = await obtenerUsuarioActual();
  const perfil = usuario ? perfilParaSidebar(usuario) : null;

  return (
    <div className="flex min-h-screen bg-panel-bg">
      <Sidebar perfil={perfil} esAdmin={esAdmin(usuario)} />
      <main className="min-w-0 flex-1 overflow-y-auto pt-14 lg:pt-0">
        <div className="mx-auto w-full max-w-7xl px-6 py-8 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}
