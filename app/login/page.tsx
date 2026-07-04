import type { Metadata } from "next";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "Iniciar sesión — Maya Studio",
};

type LoginPageProps = {
  searchParams: Promise<{ redirect?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const redirectTo =
    params.redirect?.startsWith("/") && !params.redirect.startsWith("//")
      ? params.redirect
      : "/";

  return (
    <div className="flex min-h-screen items-center justify-center bg-panel-bg px-4">
      <div className="w-full max-w-sm space-y-6 rounded-lg border border-panel-border bg-panel-surface p-6 shadow-lg">
        <div className="flex flex-col items-center text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/logo.png"
            alt="Maya Studio"
            className="h-[240px] w-[240px] object-contain"
            style={{ background: "transparent" }}
          />
          <p className="-mt-8 text-sm text-panel-text-muted">
            Inicia sesión en el panel
          </p>
        </div>

        <LoginForm redirectTo={redirectTo} />
      </div>
    </div>
  );
}
