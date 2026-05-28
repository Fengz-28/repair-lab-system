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
    <nav
      aria-label="Navegación administrativa"
      className="-mx-1 flex min-w-0 flex-1 gap-2.5 overflow-x-auto px-1 pb-1 [scrollbar-width:none] lg:mx-0 lg:justify-start lg:overflow-visible lg:px-0 lg:pb-0 [&::-webkit-scrollbar]:hidden"
    >
      {links.map((link) => {
        const isActive = isActivePath(pathname, link.href);

        return (
          <Link
            key={link.href}
            aria-current={isActive ? "page" : undefined}
            className={
              isActive
                ? "repair-nav-item repair-focus-ring relative min-h-10 shrink-0 rounded-full border border-cyan-300/20 bg-white/[0.06] px-4 py-2.5 text-sm font-black text-zinc-50 shadow-sm shadow-black/20"
                : "repair-nav-item repair-focus-ring min-h-10 shrink-0 rounded-full border border-transparent px-4 py-2.5 text-sm font-semibold text-zinc-300 hover:border-white/10 hover:bg-white/[0.06] hover:text-emerald-200 hover:shadow-sm hover:shadow-black/20"
            }
            href={link.href}
          >
            {isActive ? (
              <span className="absolute inset-x-5 -bottom-px h-px rounded-full bg-cyan-300/50" />
            ) : null}
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}

function isActivePath(pathname: string, href: string) {
  if (href === "/admin") {
    return pathname === "/admin";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}
