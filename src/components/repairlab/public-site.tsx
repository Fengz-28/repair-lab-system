import Link from "next/link";
import { ClipboardList, FileText, PackageCheck, SearchCheck } from "lucide-react";

import { AnimatedShaderBackground } from "@/components/repairlab/animated-shader-background";
import { PublicNavbarShell } from "@/components/repairlab/public-navbar-shell";
import { RepairButton, RepairContainer } from "@/components/repairlab";

const publicLinks = [
  { href: "/", label: "Inicio" },
  { href: "/services", label: "Servicios" },
  { href: "/products", label: "Productos" },
  { href: "/contact", label: "Contacto" },
];

export function PublicTopbar({ accent = "cyan" }: { accent?: "emerald" | "cyan" }) {
  const topbarClass =
    accent === "cyan"
      ? "border-b border-blue-400/30 bg-[#102a7a]/92 text-blue-100"
      : "border-b border-cyan-400/25 bg-cyan-400 text-slate-950";

  return (
    <div className={topbarClass}>
      <RepairContainer className="flex min-h-10 flex-wrap items-center justify-between gap-x-6 gap-y-2 py-2 text-xs font-bold sm:text-sm">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <span>+506 0000-0000</span>
          <span>contacto@fengzlab.local</span>
          <span className="hidden md:inline">Taller de reparacion electronica</span>
        </div>
        <span>Lun - Vie: 09:00 - 17:00</span>
      </RepairContainer>
    </div>
  );
}

export function PublicNavbar({
  accent = "cyan",
  hideOnScroll = false,
}: {
  accent?: "emerald" | "cyan";
  hideOnScroll?: boolean;
}) {
  const brandAccent = accent === "cyan" ? "text-blue-400" : "text-cyan-400";
  const logoShell =
    accent === "cyan"
      ? "grid size-12 place-items-center rounded-2xl border border-blue-300/40 bg-blue-400 text-lg font-black text-blue-950 shadow-lg shadow-blue-500/25 transition group-hover:shadow-blue-300/25"
      : "grid size-12 place-items-center rounded-2xl border border-cyan-300/35 bg-cyan-400 text-lg font-black text-slate-950 shadow-lg shadow-cyan-500/20 transition group-hover:shadow-cyan-400/20";
  const portalLink =
    accent === "cyan"
      ? "min-h-11 shrink-0 rounded-full border border-white/10 px-4 py-2.5 text-sm font-semibold text-zinc-200 transition hover:border-blue-300/35 hover:bg-blue-500/12 hover:text-blue-100"
      : "min-h-11 shrink-0 rounded-full border border-white/10 px-4 py-2.5 text-sm font-semibold text-zinc-200 transition hover:border-cyan-300/35 hover:bg-cyan-500/10 hover:text-cyan-100";

  return (
    <PublicNavbarShell hideOnScroll={hideOnScroll}>
      <RepairContainer className="flex flex-col gap-3 py-3 lg:flex-row lg:items-center lg:justify-between lg:py-4">
        <Link className="group flex items-center gap-3" href="/">
          <span className={logoShell}>F</span>
          <span>
            <span className="block text-xl font-black tracking-tight text-zinc-50">
              Fengz<span className={brandAccent}>Lab</span>
            </span>
            <span
              className={`repair-outline-button pointer-events-none mt-1 block [--border-right:2px] [--stroke-color:rgba(161,161,170,0.85)] text-[0.66rem] tracking-[0.22em] ${accent === "cyan" ? "[--animation-color:#60a5fa]" : "[--animation-color:#34d399]"}`}
              aria-hidden
            >
              <span className="repair-outline-button-label">Taller tecnico</span>
              <span className="repair-outline-button-hover">Taller tecnico</span>
            </span>
          </span>
        </Link>

        <nav className="grid w-full grid-cols-2 gap-2 sm:flex sm:min-w-0 sm:flex-1 sm:flex-wrap sm:gap-2 sm:pb-0 lg:flex-nowrap lg:justify-center">
          {publicLinks.map((link) => (
            <Link
              key={link.href}
              className="min-h-10 rounded-2xl border border-transparent px-3 py-2 text-center text-xs font-semibold text-zinc-200 transition hover:border-cyan-300/30 hover:bg-cyan-500/10 hover:text-cyan-100 sm:min-h-11 sm:shrink-0 sm:rounded-full sm:px-4 sm:py-2.5 sm:text-sm"
              href={link.href}
            >
              {link.label}
            </Link>
          ))}
          <Link
            className={`${portalLink} min-h-10 rounded-2xl px-3 py-2 text-center text-xs sm:min-h-11 sm:rounded-full sm:px-4 sm:py-2.5 sm:text-sm`}
            href="/track/demo"
          >
            Portal cliente
          </Link>
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <RepairButton href="/contact" size="sm">
            Solicitar reparacion
          </RepairButton>
          <RepairButton href="/admin" tone="secondary" size="sm">
            Admin
          </RepairButton>
        </div>
      </RepairContainer>
    </PublicNavbarShell>
  );
}

export function PublicShell({
  children,
  accent = "cyan",
  homeHideNavOnScroll = false,
}: {
  children: React.ReactNode;
  accent?: "emerald" | "cyan";
  homeHideNavOnScroll?: boolean;
}) {
  return (
    <main className="min-h-screen bg-black text-zinc-100">
      <PublicNavbar accent={accent} hideOnScroll={homeHideNavOnScroll} />
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
}: {
  eyebrow: string;
  title: string;
  description: string;
  primaryHref?: string;
  primaryLabel?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
}) {
  return (
    <section className="relative overflow-hidden border-b border-white/10 bg-black text-white">
      <AnimatedShaderBackground className="z-0 hidden sm:block" intensity="lg" />
      <div className="absolute inset-0 z-0 bg-[linear-gradient(135deg,rgba(0,0,0,0.18),rgba(0,0,0,0.90))]" />
      <RepairContainer className="relative z-10 grid gap-10 py-14 sm:py-20 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-300">{eyebrow}</p>
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
      <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-300">{eyebrow}</p>
      <h2 className="mt-3 text-3xl font-black tracking-tight text-zinc-50 sm:text-4xl">{title}</h2>
      {description ? <p className="mt-4 text-sm leading-6 text-zinc-300">{description}</p> : null}
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
    <article className="repair-rgb-card group rounded-3xl border border-white/10 bg-zinc-950/90 p-6 shadow-sm shadow-black/30 transition hover:-translate-y-1 hover:border-cyan-300/35 hover:shadow-2xl hover:shadow-cyan-950/20">
      <div className="grid size-14 place-items-center rounded-2xl border border-cyan-300/35 bg-cyan-500/20 text-sm font-black text-cyan-100">
        FL
      </div>
      <p className="mt-4 text-xs font-black uppercase tracking-[0.16em] text-cyan-300">{badge}</p>
      <h3 className="mt-3 text-xl font-black text-zinc-50">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-zinc-300">{description}</p>
      <Link className="mt-5 inline-flex text-sm font-black text-cyan-300 transition hover:text-cyan-200" href={href}>
        Consultar servicio
      </Link>
    </article>
  );
}

export function PublicFooter() {
  return (
    <footer className="relative overflow-hidden border-t border-white/10 bg-black text-zinc-300">
      <AnimatedShaderBackground className="hidden sm:block" intensity="sm" />
      <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/60 to-black/90" />
      <RepairContainer className="relative z-10 grid gap-8 py-12 md:grid-cols-[1.2fr_2fr]">
        <div className="space-y-4">
          <p className="text-2xl font-black text-white">
            Fengz<span className="text-cyan-400">Lab</span>
          </p>
          <p className="max-w-md text-sm leading-6 text-zinc-300">
            Taller de reparacion electronica con diagnostico, cotizacion, seguimiento profesional y entrega documentada.
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-3">
          <FooterGroup title="Servicios" items={["Diagnostico", "Consolas", "Microsoldadura", "Mantenimiento"]} />
          <FooterGroup title="Enlaces rapidos" items={["Inicio", "Servicios", "Productos", "Contacto"]} />
          <FooterGroup title="Contacto" items={["contacto@fengzlab.local", "+506 0000-0000", "Lun - Vie"]} />
        </div>
      </RepairContainer>
      <div className="relative z-10 border-t border-white/10 py-5 text-center text-xs text-zinc-500">
        FengzLab. Taller tecnico con seguimiento transparente.
      </div>
    </footer>
  );
}

function TechVisual() {
  const flow = [
    { label: "Recepcion segura", icon: ClipboardList },
    { label: "Diagnostico tecnico", icon: SearchCheck },
    { label: "Cotizacion transparente", icon: FileText },
    { label: "Entrega documentada", icon: PackageCheck },
  ];

  return (
    <div className="relative mx-auto w-full max-w-md">
      <div className="absolute -inset-6 rounded-[2rem] bg-cyan-500/20 blur-3xl" />
      <div className="repair-premium-card relative rounded-[2rem] border border-white/10 bg-zinc-900/45 p-5 shadow-2xl shadow-black/30 backdrop-blur">
        <div className="rounded-3xl border border-white/10 bg-zinc-950/80 p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-[0.18em] text-cyan-300">Mesa tecnica</span>
            <span className="rounded-full bg-cyan-400 px-3 py-1 text-xs font-black text-slate-950">Activa</span>
          </div>
          <div className="mt-5 grid gap-3">
            {flow.map((item) => (
              <div key={item.label} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-zinc-900/35 p-3">
                <span className="grid size-9 place-items-center rounded-full border border-cyan-300/35 bg-cyan-500/20 text-cyan-100">
                  <item.icon className="size-4" />
                </span>
                <span className="text-sm font-semibold text-zinc-200">{item.label}</span>
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
