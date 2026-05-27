"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavLink = {
  href: string;
  label: string;
};

export function RepairNavLinks({ links }: { links: NavLink[] }) {
  const pathname = usePathname();

  return (
    <div className="flex min-w-0 flex-1 gap-2 overflow-x-auto pb-1 lg:justify-center lg:overflow-visible lg:pb-0">
      {links.map((link) => {
        const isActive = isActivePath(pathname, link.href);

        return (
          <Link
            key={link.href}
            aria-current={isActive ? "page" : undefined}
            className={
              isActive
                ? "repair-nav-item repair-focus-ring relative min-h-11 shrink-0 rounded-full border border-cyan-300/30 bg-cyan-500/12 px-4 py-2.5 text-sm font-black text-cyan-100 shadow-sm shadow-cyan-950/25"
                : "repair-nav-item repair-focus-ring min-h-11 shrink-0 rounded-full border border-transparent px-4 py-2.5 text-sm font-semibold text-zinc-200 hover:border-white/10 hover:bg-emerald-500/10 hover:text-emerald-200 hover:shadow-sm hover:shadow-cyan-950/20"
            }
            href={link.href}
          >
            {isActive ? (
              <span className="absolute inset-x-4 -bottom-px h-px rounded-full bg-cyan-300/70 shadow-sm shadow-cyan-300/40" />
            ) : null}
            {link.label}
          </Link>
        );
      })}
    </div>
  );
}

function isActivePath(pathname: string, href: string) {
  if (href === "/admin") {
    return pathname === "/admin";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}
