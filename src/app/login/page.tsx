import { redirect } from "next/navigation";

import { RepairFooter, RepairPageHero } from "@/components/repairlab";
import { getCurrentStaffSession } from "@/server/auth/local-admin";

import { LoginForm } from "./login-form";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const session = await getCurrentStaffSession();

  if (session) {
    redirect("/admin");
  }

  return (
    <main className="min-h-screen bg-white text-zinc-950 dark:bg-zinc-950 dark:text-zinc-50">
      <RepairPageHero
        eyebrow="Home / Login"
        title="Acceso administrativo"
        description="Ingreso seguro para operar tickets, clientes, cotizaciones, facturas, pagos e inventario del taller."
      />

      <section className="px-4 py-12 sm:py-16">
        <div className="mx-auto w-full max-w-md">
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl shadow-zinc-950/10 dark:border-zinc-800 dark:bg-zinc-950">
            <div className="text-center">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-emerald-600">RepairLab</p>
              <h1 className="mt-2 text-3xl font-black">Login</h1>
              <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                Ingresa con tu usuario interno para administrar el taller.
              </p>
            </div>
            <div className="mt-8">
              <LoginForm />
            </div>
          </div>
        </div>
      </section>

      <RepairFooter />
    </main>
  );
}
