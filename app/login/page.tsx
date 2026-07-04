import type { Metadata } from "next";
import Image from "next/image";
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
          <Image
            src="/images/logo.png"
            alt="Maya Studio"
            width={240}
            height={240}
            className="h-[240px] w-[240px] object-contain"
            priority
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
