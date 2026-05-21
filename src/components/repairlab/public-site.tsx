import Link from "next/link";

import { RepairBadge, RepairButton, RepairContainer } from "./index";

const publicLinks = [
  { href: "/", label: "Inicio" },
  { href: "/services", label: "Servicios" },
  { href: "/products", label: "Productos" },
  { href: "/contact", label: "Contacto" },
];

export function PublicTopbar() {
  return (
    <div className="border-b border-emerald-400/30 bg-emerald-500 text-white">
      <RepairContainer className="flex min-h-10 flex-wrap items-center justify-between gap-x-6 gap-y-2 py-2 text-xs font-medium sm:text-sm">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <span>+506 0000-0000</span>
          <span>soporte@repairlab.local</span>
          <span className="hidden md:inline">Taller electronico / demo controlada</span>
        </div>
        <span>Lun - Vie: 09:00 - 17:00</span>
      </RepairContainer>
    </div>
  );
}

export function PublicNavbar() {
  return (
    <div className="sticky top-0 z-30 border-b border-zinc-200/80 bg-white/95 shadow-sm backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/95">
      <RepairContainer className="flex flex-col gap-4 py-4 lg:flex-row lg:items-center lg:justify-between">
        <Link className="group flex items-center gap-3" href="/">
          <span className="grid size-12 place-items-center rounded-2xl bg-emerald-500 text-lg font-black text-white shadow-lg shadow-emerald-500/20 transition group-hover:scale-105">
            R
          </span>
          <span>
            <span className="block text-xl font-black tracking-tight text-zinc-950 dark:text-zinc-50">
              Repair<span className="text-emerald-500">Lab</span>
            </span>
            <span className="block text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
              Electronic repair
            </span>
          </span>
        </Link>

        <nav className="flex min-w-0 flex-1 gap-2 overflow-x-auto pb-1 lg:justify-center lg:overflow-visible lg:pb-0">
          {publicLinks.map((link) => (
            <Link
              key={link.href}
              className="min-h-11 shrink-0 rounded-full px-4 py-2.5 text-sm font-semibold text-zinc-700 transition hover:bg-emerald-50 hover:text-emerald-700 dark:text-zinc-200 dark:hover:bg-emerald-950 dark:hover:text-emerald-200"
              href={link.href}
            >
              {link.label}
            </Link>
          ))}
          <Link className="min-h-11 shrink-0 rounded-full px-4 py-2.5 text-sm font-semibold text-zinc-700 transition hover:bg-cyan-50 hover:text-cyan-700 dark:text-zinc-200 dark:hover:bg-cyan-950 dark:hover:text-cyan-200" href="/track/demo">
            Portal cliente
          </Link>
        </nav>

        <div className="grid gap-2 sm:flex">
          <RepairButton href="/contact" size="sm">
            Solicitar reparacion
          </RepairButton>
          <RepairButton href="/admin" tone="secondary" size="sm">
            Admin
          </RepairButton>
        </div>
      </RepairContainer>
    </div>
  );
}

export function PublicShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-zinc-50 text-zinc-950 dark:bg-zinc-950 dark:text-zinc-100">
      <PublicTopbar />
      <PublicNavbar />
      {children}
      <PublicFooter />
    </main>
  );
}

export function PublicHero({
  eyebrow,
  title,
  description,
  primaryHref = "/contact",
  primaryLabel = "Solicitar reparacion",
  secondaryHref,
  secondaryLabel,
  badge,
}: {
  eyebrow: string;
  title: string;
  description: string;
  primaryHref?: string;
  primaryLabel?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
  badge?: string;
}) {
  return (
    <section className="relative overflow-hidden bg-zinc-950 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(16,185,129,0.26),transparent_30%),radial-gradient(circle_at_85%_0%,rgba(6,182,212,0.18),transparent_30%),linear-gradient(135deg,rgba(15,23,42,0.1),rgba(0,0,0,0.88))]" />
      <div className="absolute inset-0 opacity-25 [background-image:linear-gradient(120deg,transparent_0,transparent_47%,rgba(255,255,255,0.08)_48%,transparent_50%)] [background-size:46px_46px]" />
      <RepairContainer className="relative grid gap-10 py-14 sm:py-20 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-emerald-300">{eyebrow}</p>
          <h1 className="mt-4 max-w-4xl text-4xl font-black tracking-tight sm:text-6xl">{title}</h1>
          <p className="mt-5 max-w-2xl text-sm leading-7 text-zinc-300 sm:text-base">{description}</p>
          <div className="mt-7 grid gap-3 sm:flex sm:flex-wrap">
            <RepairButton href={primaryHref}>{primaryLabel}</RepairButton>
            {secondaryHref && secondaryLabel ? (
              <RepairButton href={secondaryHref} tone="secondary">
                {secondaryLabel}
              </RepairButton>
            ) : null}
          </div>
          {badge ? <div className="mt-6"><RepairBadge tone="cyan">{badge}</RepairBadge></div> : null}
        </div>
        <TechVisual />
      </RepairContainer>
    </section>
  );
}

export function PublicSectionHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-300">{eyebrow}</p>
      <h2 className="mt-3 text-3xl font-black tracking-tight text-zinc-950 dark:text-zinc-50 sm:text-4xl">{title}</h2>
      {description ? <p className="mt-4 text-sm leading-6 text-zinc-600 dark:text-zinc-300">{description}</p> : null}
    </div>
  );
}

export function PublicServiceCard({
  title,
  description,
  badge,
  href = "/contact",
}: {
  title: string;
  description: string;
  badge: string;
  href?: string;
}) {
  return (
    <article className="group rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm shadow-zinc-950/5 transition hover:-translate-y-1 hover:border-emerald-300 hover:shadow-2xl hover:shadow-emerald-950/10 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-emerald-800">
      <div className="grid size-14 place-items-center rounded-2xl bg-emerald-50 text-sm font-black text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200">
        RL
      </div>
      <RepairBadge tone="cyan">{badge}</RepairBadge>
      <h3 className="mt-5 text-xl font-black text-zinc-950 dark:text-zinc-50">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-300">{description}</p>
      <Link className="mt-5 inline-flex text-sm font-black text-emerald-600 transition hover:text-emerald-700 dark:text-emerald-300" href={href}>
        Consultar servicio
      </Link>
    </article>
  );
}

export function PublicFooter() {
  return (
    <footer className="bg-zinc-950 text-zinc-300">
      <RepairContainer className="grid gap-8 py-10 md:grid-cols-[1.2fr_2fr]">
        <div>
          <p className="text-2xl font-black text-white">
            Repair<span className="text-emerald-400">Lab</span>
          </p>
          <p className="mt-3 max-w-md text-sm leading-6 text-zinc-400">
            Servicio tecnico para electronica, consolas, controles y componentes. Sistema de seguimiento de reparacion
            preparado para clientes.
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-3">
          <FooterGroup title="Servicios" items={["Diagnostico", "Consolas", "Microsoldadura", "Mantenimiento"]} />
          <FooterGroup title="Enlaces" items={["Inicio", "Servicios", "Productos", "Contacto"]} />
          <FooterGroup title="Contacto" items={["soporte@repairlab.local", "+506 0000-0000", "Lun - Vie"]} />
        </div>
      </RepairContainer>
      <div className="border-t border-zinc-800 py-5 text-center text-xs text-zinc-500">
        RepairLab. Sistema de seguimiento de reparacion.
      </div>
    </footer>
  );
}

function TechVisual() {
  return (
    <div className="relative mx-auto w-full max-w-md">
      <div className="absolute -inset-6 rounded-[2rem] bg-emerald-500/15 blur-3xl" />
      <div className="relative rounded-[2rem] border border-white/10 bg-white/10 p-5 shadow-2xl shadow-black/30 backdrop-blur">
        <div className="rounded-3xl border border-white/10 bg-zinc-950/80 p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-[0.18em] text-emerald-300">Repair bench</span>
            <span className="rounded-full bg-emerald-400 px-3 py-1 text-xs font-black text-zinc-950">Online</span>
          </div>
          <div className="mt-5 grid gap-3">
            {["Recepcion segura", "Diagnostico tecnico", "Cotizacion transparente", "Entrega documentada"].map((item, index) => (
              <div key={item} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3">
                <span className="grid size-9 place-items-center rounded-full bg-emerald-500 text-xs font-black text-white">
                  {index + 1}
                </span>
                <span className="text-sm font-semibold text-zinc-200">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function FooterGroup({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h3 className="font-bold text-white">{title}</h3>
      <ul className="mt-3 space-y-2 text-sm text-zinc-400">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
