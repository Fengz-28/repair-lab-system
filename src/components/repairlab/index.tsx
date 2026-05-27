import Link from "next/link";
import type React from "react";

import { RepairNavLinks } from "@/components/repairlab/repair-nav-links";

type NavLink = {
  href: string;
  label: string;
};

export function RepairTopbar() {
  return (
    <div className="border-b border-emerald-400/30 bg-emerald-500 text-white">
      <RepairContainer className="flex min-h-10 flex-wrap items-center justify-between gap-x-6 gap-y-2 py-2 text-xs font-medium sm:text-sm">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <span className="inline-flex items-center gap-2">
            <span className="grid size-6 place-items-center rounded-full border border-white/30">T</span>
            +506 0000-0000
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="grid size-6 place-items-center rounded-full border border-white/30">E</span>
            soporte@repairlab.local
          </span>
          <span className="hidden items-center gap-2 md:inline-flex">
            <span className="grid size-6 place-items-center rounded-full border border-white/30">L</span>
            Taller local / demo controlada
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <span className="hidden sm:inline">Sistema interno RepairLab</span>
          <span className="inline-flex items-center gap-2">
            <span className="grid size-6 place-items-center rounded-full border border-white/30">H</span>
            Lun - Vie: 09:00 - 17:00
          </span>
        </div>
      </RepairContainer>
    </div>
  );
}

export function RepairNavbar({
  links,
  user,
}: {
  links: NavLink[];
  user?: {
    name: string;
    role: string;
  } | null;
}) {
  return (
    <div className="sticky top-0 z-30 border-b border-white/10 bg-black/90 shadow-sm shadow-black/30 backdrop-blur-xl">
      <RepairContainer className="flex flex-col gap-4 py-4 lg:flex-row lg:items-center lg:justify-between">
        <Link className="group flex items-center gap-3" href="/admin">
            <span className="repair-card-motion grid size-12 place-items-center rounded-2xl bg-emerald-500 text-lg font-black text-black shadow-lg shadow-emerald-500/25 group-hover:shadow-cyan-400/20">
            R
          </span>
          <span>
            <span className="block text-xl font-black tracking-tight text-zinc-950 dark:text-zinc-50">
              Repair<span className="text-emerald-500">Lab</span>
            </span>
            <span className="block text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
              Service OS
            </span>
          </span>
        </Link>

        <RepairNavLinks links={links} />

        {user ? (
          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-2xl border border-white/10 bg-zinc-900/80 px-4 py-2">
              <p className="max-w-48 truncate text-sm font-semibold text-zinc-950 dark:text-zinc-50">
                {user.name}
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">{user.role}</p>
            </div>
            <form action="/logout" method="post">
              <RepairButton as="button" tone="ghost" size="sm">
                Salir
              </RepairButton>
            </form>
          </div>
        ) : null}
      </RepairContainer>
    </div>
  );
}

export function RepairDropdownMenu({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="repair-panel-reveal rounded-b-3xl border border-white/10 bg-zinc-950 p-5 shadow-2xl shadow-black/40">
      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-600">{title}</p>
      <div className="grid gap-2">{children}</div>
    </div>
  );
}

export function RepairPageHero({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <section className="relative overflow-hidden bg-black text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(16,185,129,0.18),transparent_28%),radial-gradient(circle_at_80%_0%,rgba(6,182,212,0.10),transparent_30%),linear-gradient(135deg,rgba(24,24,27,0.2),rgba(0,0,0,0.88))]" />
      <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(120deg,transparent_0,transparent_48%,rgba(255,255,255,0.08)_49%,transparent_50%)] [background-size:42px_42px]" />
      <RepairContainer className="relative py-12 sm:py-16">
        {eyebrow ? (
          <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-300">{eyebrow}</p>
        ) : null}
        <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <h1 className="text-3xl font-black tracking-tight sm:text-5xl">{title}</h1>
            {description ? (
              <p className="mt-4 max-w-2xl text-sm leading-6 text-zinc-300 sm:text-base">{description}</p>
            ) : null}
          </div>
          {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
        </div>
      </RepairContainer>
    </section>
  );
}

export function RepairContainer({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={`mx-auto w-full max-w-7xl px-4 sm:px-6 ${className}`}>{children}</div>;
}

export function RepairSection({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <section className={`space-y-5 ${className}`}>{children}</section>;
}

export function RepairCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`repair-panel-reveal repair-card-motion relative overflow-hidden rounded-2xl border border-white/10 bg-[linear-gradient(135deg,rgba(24,24,27,0.96),rgba(3,7,18,0.9))] p-5 shadow-sm shadow-black/30 hover:border-cyan-300/35 hover:shadow-2xl hover:shadow-cyan-950/20 ${className}`}
    >
      <div className="pointer-events-none absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/35 to-transparent" />
      {children}
    </div>
  );
}

export function RepairPanel({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`repair-panel-reveal relative overflow-hidden rounded-2xl border border-white/10 bg-[linear-gradient(135deg,rgba(18,18,20,0.96),rgba(3,3,3,0.92))] p-5 shadow-sm shadow-black/30 backdrop-blur ${className}`}>
      <div className="pointer-events-none absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-emerald-300/25 to-transparent" />
      {children}
    </div>
  );
}

export function RepairButton({
  children,
  href,
  as = "link",
  tone = "primary",
  size = "md",
}: {
  children: React.ReactNode;
  href?: string;
  as?: "link" | "button";
  tone?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md";
}) {
  const toneClass = {
    primary: "border border-emerald-300/40 bg-emerald-500 text-black shadow-lg shadow-emerald-500/25 hover:bg-emerald-400 hover:shadow-cyan-400/20",
    secondary:
      "border border-white/15 bg-zinc-800 text-zinc-50 shadow-sm shadow-black/20 hover:border-cyan-300/35 hover:bg-zinc-700 hover:text-white",
    ghost:
      "border border-white/15 bg-zinc-900/90 text-zinc-100 shadow-sm shadow-black/20 hover:border-white/25 hover:bg-zinc-800 hover:text-white",
  }[tone];
  const sizeClass = size === "sm" ? "min-h-10 px-4 py-2 text-xs" : "min-h-11 px-5 py-2.5 text-sm";
  const className = `repair-button-motion repair-focus-ring inline-flex items-center justify-center rounded-full font-bold disabled:cursor-not-allowed disabled:border-white/5 disabled:bg-zinc-900 disabled:text-zinc-500 disabled:shadow-none ${toneClass} ${sizeClass}`;

  if (as === "button") {
    return (
      <button type="submit" className={className}>
        {children}
      </button>
    );
  }

  return (
    <Link className={className} href={href ?? "#"}>
      {children}
    </Link>
  );
}

export function RepairBadge({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "emerald" | "cyan" | "warning" | "danger" | "violet";
}) {
  const classes = {
    neutral: "border-white/10 bg-zinc-900 text-zinc-200",
    emerald: "border-emerald-400/30 bg-emerald-500/15 text-emerald-100",
    cyan: "border-cyan-400/30 bg-cyan-500/12 text-cyan-100",
    warning: "border-amber-400/35 bg-amber-500/15 text-amber-100",
    danger: "border-red-400/35 bg-red-500/15 text-red-100",
    violet: "border-violet-400/35 bg-violet-500/15 text-violet-100",
  }[tone];
  const dotClasses = {
    neutral: "bg-zinc-400",
    emerald: "bg-emerald-300",
    cyan: "bg-cyan-300",
    warning: "bg-amber-300",
    danger: "bg-red-300",
    violet: "bg-violet-300",
  }[tone];

  const shouldPulse = tone === "cyan" || tone === "warning" || tone === "violet";

  return (
    <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-bold shadow-sm shadow-black/20 ${classes}`}>
      <span className={`size-1.5 rounded-full ${dotClasses} ${shouldPulse ? "repair-status-dot" : ""}`} />
      {children}
    </span>
  );
}

export function RepairDropdownItem({
  children,
  href,
}: {
  children: React.ReactNode;
  href: string;
}) {
  return (
    <Link
      className="repair-dropdown-item repair-focus-ring rounded-2xl border border-transparent px-3 py-2 text-sm font-semibold text-zinc-200 hover:border-cyan-300/25 hover:bg-cyan-500/10 hover:text-cyan-100"
      href={href}
    >
      {children}
    </Link>
  );
}

export function RepairTable({ children }: { children: React.ReactNode }) {
  return (
    <div className="repair-panel-reveal overflow-hidden rounded-2xl border border-white/10 bg-[linear-gradient(135deg,rgba(18,18,20,0.96),rgba(3,3,3,0.92))] shadow-sm shadow-black/30">
      <div className="overflow-x-auto">{children}</div>
    </div>
  );
}

export function RepairStatCard({
  label,
  value,
  tone = "emerald",
}: {
  label: string;
  value: string | number;
  tone?: "emerald" | "cyan" | "warning" | "neutral";
}) {
  const glow = {
    emerald: "from-emerald-500/18",
    cyan: "from-cyan-500/18",
    warning: "from-amber-500/18",
    neutral: "from-zinc-500/12",
  }[tone];
  const bar = {
    emerald: "from-emerald-400 to-cyan-300",
    cyan: "from-cyan-300 to-sky-400",
    warning: "from-amber-300 to-emerald-300",
    neutral: "from-zinc-500 to-zinc-300",
  }[tone];

  return (
    <RepairCard className={`relative overflow-hidden bg-gradient-to-br ${glow} to-transparent`}>
      <p className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">{label}</p>
      <p className="mt-3 break-words text-3xl font-black tracking-tight text-zinc-950 dark:text-zinc-50">
        {value}
      </p>
      <div className="mt-5 h-1 overflow-hidden rounded-full bg-zinc-900/35">
        <div className={`h-full w-2/3 rounded-full bg-gradient-to-r ${bar} transition-[width] duration-700`} />
      </div>
    </RepairCard>
  );
}

export function RepairEmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <RepairPanel className="py-10 text-center">
      <div className="mx-auto grid size-14 place-items-center rounded-2xl border border-emerald-400/20 bg-emerald-500/15 text-emerald-200">
        RL
      </div>
      <h2 className="mt-4 text-lg font-black text-zinc-950 dark:text-zinc-50">{title}</h2>
      {description ? <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">{description}</p> : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </RepairPanel>
  );
}

export function RepairSearchBar({ children }: { children: React.ReactNode }) {
  return <RepairPanel className="shadow-lg shadow-black/20">{children}</RepairPanel>;
}

export function RepairActionBar({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-2 sm:flex sm:flex-wrap sm:items-center">{children}</div>;
}

export function RepairSkeleton({
  className = "",
}: {
  className?: string;
}) {
  return (
    <div
      aria-hidden="true"
      className={`repair-skeleton overflow-hidden rounded-2xl border border-white/10 bg-zinc-950/80 ${className}`}
    />
  );
}

export function RepairSkeletonCard() {
  return (
    <div className="repair-panel-reveal rounded-2xl border border-white/10 bg-zinc-950/80 p-5 shadow-sm shadow-black/30">
      <RepairSkeleton className="h-4 w-28" />
      <RepairSkeleton className="mt-4 h-9 w-40" />
      <RepairSkeleton className="mt-5 h-2 w-full" />
    </div>
  );
}

export function RepairFooter() {
  return (
    <footer className="bg-zinc-950 text-zinc-300">
      <RepairContainer className="grid gap-8 py-10 md:grid-cols-[1.1fr_2fr]">
        <div>
          <p className="text-2xl font-black text-white">
            Repair<span className="text-emerald-400">Lab</span>
          </p>
          <p className="mt-3 max-w-sm text-sm leading-6 text-zinc-400">
            Plataforma interna para operar reparaciones, clientes, cotizaciones, pagos e inventario.
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-3">
          <FooterGroup title="Operaciones" items={["Recepcion", "Tickets", "Cotizaciones", "Facturas"]} />
          <FooterGroup title="Gestion" items={["Clientes", "Inventario", "Mensajes", "Dashboard"]} />
          <FooterGroup title="Contacto" items={["soporte@repairlab.local", "+506 0000-0000", "Lun - Vie"]} />
        </div>
      </RepairContainer>
      <div className="border-t border-zinc-800 py-5 text-center text-xs text-zinc-500">
        RepairLab System. Documento visual interno para demo controlada.
      </div>
    </footer>
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
