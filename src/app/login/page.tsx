import { redirect } from "next/navigation";

import { RepairFooter, RepairPageHero } from "@/components/repairlab";
import { getCurrentStaffSession } from "@/server/auth/local-admin";

import { LoginForm } from "./login-form";

export const dynamic = "force-dynamic";

type LoginPageProps = {
  searchParams?: Promise<{ next?: string | string[] }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const next = safeAdminRedirect(Array.isArray(params?.next) ? params.next[0] : params?.next);
  const session = await getCurrentStaffSession();

  if (session) {
    redirect(next);
  }

  return (
    <main className="min-h-screen bg-black text-zinc-50">
      <RepairPageHero
        eyebrow="Inicio / Acceso"
        title="Acceso administrativo"
        description="Ingreso seguro para operar tickets, clientes, cotizaciones, facturas, pagos e inventario del taller."
      />

      <section className="px-4 py-12 sm:py-16">
        <div className="mx-auto w-full max-w-md">
          <div className="rounded-2xl border border-white/10 bg-zinc-950/90 p-6 shadow-2xl shadow-black/40">
            <div className="text-center">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-emerald-600">RepairLab</p>
              <h1 className="mt-2 text-3xl font-black">Iniciar sesión</h1>
              <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                Ingresa con tu usuario interno para administrar el taller.
              </p>
            </div>
            <div className="mt-8">
              <LoginForm next={next} />
            </div>
          </div>
        </div>
      </section>

      <RepairFooter />
    </main>
  );
}

function safeAdminRedirect(value?: string) {
  if (!value || !value.startsWith("/admin")) {
    return "/admin";
  }

  if (value.startsWith("//") || value.includes("://") || value.includes("\\")) {
    return "/admin";
  }

  return value;
}
