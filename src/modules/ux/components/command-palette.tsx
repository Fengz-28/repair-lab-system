"use client";

import type React from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname, useRouter } from "next/navigation";

import { RepairBadge, RepairSkeleton } from "@/components/repairlab";
import { useCommandPalette } from "@/modules/ux/hooks/use-command-palette";
import { useGlobalSearch } from "@/modules/ux/hooks/use-global-search";
import { useKeyboardShortcuts } from "@/modules/ux/hooks/use-keyboard-shortcuts";
import { keyboardShortcuts, shortcutDisplay } from "@/modules/ux/lib/keyboard-shortcuts";
import { getQuickActions, type QuickAction } from "@/modules/ux/lib/quick-actions";
import type {
  GlobalSearchCategory,
  GlobalSearchResult,
} from "@/modules/ux/search/global-search";

const searchCategoryLabels: Record<GlobalSearchCategory, string> = {
  tickets: "Tickets",
  customers: "Clientes",
  messages: "Mensajes",
};

type SelectableCommandItem = {
  key: string;
  href: string;
};

export function CommandPalette() {
  const router = useRouter();
  const pathname = usePathname();
  const inputRef = useRef<HTMLInputElement>(null);
  const { actions, close, open, openPalette, query, setQuery } = useCommandPalette();
  const search = useGlobalSearch(query);
  const quickActions = useMemo(() => getQuickActions(pathname), [pathname]);
  const quickActionHrefs = useMemo(() => new Set(quickActions.map((action) => action.href)), [quickActions]);
  const visibleActions = useMemo(() => {
    return actions.filter((action) => !action.href || !quickActionHrefs.has(action.href));
  }, [actions, quickActionHrefs]);
  const searchableResults = useMemo(() => {
    if (!search.data?.total) {
      return [];
    }

    return Object.entries(search.data.results).flatMap(([category, results]) =>
      results.map((result) => ({
        ...result,
        category: category as GlobalSearchCategory,
      })),
    );
  }, [search.data]);
  const selectableItems = useMemo<SelectableCommandItem[]>(() => {
    const quickItems = quickActions.map((action) => ({
      key: `quick:${action.id}`,
      href: action.href,
    }));
    const staticItems = visibleActions
      .filter((action) => action.href && !action.disabled)
      .map((action) => ({
        key: `action:${action.id}`,
        href: action.href ?? "",
      }));
    const resultItems = searchableResults.map((result) => ({
      key: searchResultKey(result),
      href: result.href,
    }));

    return [...quickItems, ...staticItems, ...resultItems];
  }, [quickActions, searchableResults, visibleActions]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const safeSelectedIndex = selectableItems.length
    ? Math.min(Math.max(selectedIndex, 0), selectableItems.length - 1)
    : -1;
  const selectedItem = selectableItems[safeSelectedIndex] ?? null;
  const searchResultCount = search.enabled && search.data ? search.data.total : null;
  const navigateFromShortcut = useCallback((href: string) => {
    router.push(href);
  }, [router]);
  const openPaletteFromShortcut = useCallback(() => {
    openPalette();
  }, [openPalette]);

  useKeyboardShortcuts({
    enabled: !open,
    onNavigate: navigateFromShortcut,
    onOpenCommandPalette: openPaletteFromShortcut,
  });

  useEffect(() => {
    if (open) {
      window.setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open]);

  useEffect(() => {
    if (!open || !selectedItem) {
      return;
    }

    document.getElementById(selectedItem.key)?.scrollIntoView({
      block: "nearest",
      inline: "nearest",
    });
  }, [open, selectedItem]);

  function runAction(href?: string, disabled?: boolean) {
    if (!href || disabled) {
      return;
    }

    close();
    router.push(href);
  }

  function handleKeyDown(event: React.KeyboardEvent) {
    if (!open) {
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      close();
      return;
    }

    if (!selectableItems.length) {
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setSelectedIndex((safeSelectedIndex + 1) % selectableItems.length);
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setSelectedIndex(safeSelectedIndex <= 0 ? selectableItems.length - 1 : safeSelectedIndex - 1);
      return;
    }

    if (event.key === "Enter" && !(event.target instanceof HTMLButtonElement)) {
      event.preventDefault();
      runAction(selectedItem?.href);
    }
  }

  function handleQueryChange(value: string) {
    setQuery(value);
    setSelectedIndex(0);
  }

  const paletteDialog = open ? (
    <div
      className="fixed inset-0 z-[120] flex items-start justify-center bg-black/80 p-3 backdrop-blur-sm motion-safe:animate-in motion-safe:fade-in sm:p-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          close();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="command-palette-title"
        onKeyDown={handleKeyDown}
        className="repair-panel-reveal mt-12 w-full max-w-2xl overflow-hidden rounded-[2rem] border border-cyan-300/25 bg-zinc-950/98 shadow-2xl shadow-black/50 ring-1 ring-white/10 sm:mt-16"
      >
        <div className="border-b border-white/10 p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-300">
                UX Layer
              </p>
              <h2 id="command-palette-title" className="mt-1 text-lg font-black text-zinc-50">
                Paleta de comandos
              </h2>
            </div>
            <RepairBadge tone="cyan">Ctrl / Cmd K</RepairBadge>
          </div>
          <label className="mt-5 block">
            <span className="sr-only">Buscar comando</span>
            <input
              ref={inputRef}
              value={query}
              onChange={(event) => handleQueryChange(event.target.value)}
              placeholder="Buscar acción o destino..."
              aria-label="Buscar comandos, tickets, clientes y mensajes"
              className="min-h-12 w-full rounded-2xl border border-white/10 bg-black px-4 py-3 text-sm text-white placeholder:text-zinc-500 outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-500/20"
            />
          </label>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-3 sm:p-4">
          <CommandSection title="Acciones rápidas">
            <ul className="grid gap-2">
              {quickActions.map((action) => (
                <li key={action.id}>
                  <QuickActionButton
                    action={action}
                    selected={selectedItem?.key === `quick:${action.id}`}
                    onOpen={(href) => runAction(href)}
                    onSelect={(key) => setSelectedIndex(indexForKey(selectableItems, key))}
                  />
                </li>
              ))}
            </ul>
          </CommandSection>

          <CommandSection title="Acciones">
            {visibleActions.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-zinc-950/75 p-4 text-sm text-zinc-400">
                No hay comandos estáticos para esa búsqueda.
              </div>
            ) : (
              <ul className="grid gap-2">
                {visibleActions.map((action) => (
                  <li key={action.id}>
                    <button
                      id={`action:${action.id}`}
                      type="button"
                      disabled={action.disabled}
                      onMouseEnter={() => {
                        if (action.href && !action.disabled) {
                          setSelectedIndex(indexForKey(selectableItems, `action:${action.id}`));
                        }
                      }}
                      onClick={() => runAction(action.href, action.disabled)}
                      className={commandItemClass(selectedItem?.key === `action:${action.id}`)}
                    >
                      <span className="min-w-0">
                        <span className="block break-words text-sm font-black text-zinc-50">
                          {action.label}
                        </span>
                        <span className="mt-1 block break-words text-xs leading-5 text-zinc-400">
                          {action.description}
                        </span>
                      </span>
                      <span className="shrink-0 rounded-full border border-white/10 bg-black/40 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-zinc-400 group-hover:text-cyan-100">
                        {action.disabled ? "Próximamente" : "Abrir"}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </CommandSection>

          {search.enabled ? (
            <CommandSection
              title={
                searchResultCount === null
                  ? "Búsqueda global"
                  : `Búsqueda global (${searchResultCount})`
              }
            >
              {search.loading ? (
                <div className="grid gap-2">
                  <RepairSkeleton className="h-16" />
                  <RepairSkeleton className="h-16" />
                </div>
              ) : search.error ? (
                <div className="rounded-2xl border border-red-300/25 bg-red-500/10 p-4 text-sm text-red-100">
                  {search.error}
                </div>
              ) : search.data?.total ? (
                <div className="grid gap-4">
                  {Object.entries(search.data.results).map(([category, results]) =>
                    results.length ? (
                      <SearchResultSection
                        key={category}
                        category={category as GlobalSearchCategory}
                        results={results}
                        onOpen={(href) => runAction(href)}
                        onSelect={(key) => setSelectedIndex(indexForKey(selectableItems, key))}
                        selectedKey={selectedItem?.key}
                      />
                    ) : null,
                  )}
                </div>
              ) : (
                <div className="rounded-2xl border border-white/10 bg-zinc-950/75 p-4 text-sm text-zinc-400">
                  No encontramos tickets, clientes ni mensajes para &quot;{query.trim()}&quot;.
                </div>
              )}
            </CommandSection>
          ) : (
            <div className="mt-4 rounded-2xl border border-cyan-300/15 bg-cyan-500/10 p-4 text-xs leading-5 text-cyan-100">
              Escribe al menos 2 caracteres para buscar tickets, clientes y mensajes.
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/10 bg-black/35 px-4 py-3 text-[11px] font-bold text-zinc-500 sm:px-5">
          <span className="text-zinc-400">Atajos</span>
          <div className="flex flex-wrap items-center gap-2">
            <ShortcutHint keys="↑/↓" label="Navegar" />
            <ShortcutHint keys="Enter" label="Abrir" />
            <ShortcutHint keys="Esc" label="Cerrar" />
          </div>
        </div>
        <div className="border-t border-white/10 bg-zinc-950/80 px-4 py-3 sm:px-5">
          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-zinc-500">
            Navegación rápida
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {keyboardShortcuts
              .filter((shortcut) => shortcut.href)
              .map((shortcut) => (
                <ShortcutHint
                  key={shortcut.id}
                  keys={shortcutDisplay(shortcut.keys)}
                  label={shortcut.label.replace("Ir a ", "").replace("Ir al ", "")}
                />
              ))}
          </div>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <>
      <button
        type="button"
        className="repair-button-motion repair-focus-ring hidden min-h-10 shrink-0 items-center gap-2 rounded-full border border-white/10 bg-zinc-950/85 px-3.5 py-2 text-xs font-black text-zinc-300 shadow-sm shadow-black/20 hover:border-cyan-300/25 hover:bg-white/[0.06] hover:text-cyan-100 xl:inline-flex"
        onClick={openPalette}
        aria-label="Abrir paleta de comandos"
      >
        <span>Comandos</span>
        <kbd className="rounded-full border border-white/10 bg-black/60 px-2 py-0.5 text-[10px] font-black text-zinc-400">
          Ctrl K
        </kbd>
      </button>

      <button
        type="button"
        className="repair-button-motion repair-focus-ring fixed bottom-4 right-4 z-40 inline-flex min-h-11 items-center justify-center rounded-full border border-cyan-300/25 bg-zinc-950/90 px-4 py-2 text-xs font-black text-cyan-100 shadow-2xl shadow-black/40 backdrop-blur lg:hidden"
        onClick={openPalette}
      >
        Ctrl K
      </button>

      {typeof document !== "undefined" ? createPortal(paletteDialog, document.body) : null}
    </>
  );
}

function ShortcutHint({
  keys,
  label,
}: {
  keys: string;
  label: string;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-zinc-950/80 px-2.5 py-1">
      <kbd className="font-black text-zinc-200">{keys}</kbd>
      <span>{label}</span>
    </span>
  );
}

function QuickActionButton({
  action,
  onOpen,
  onSelect,
  selected,
}: {
  action: QuickAction;
  onOpen: (href: string) => void;
  onSelect: (key: string) => void;
  selected: boolean;
}) {
  const key = `quick:${action.id}`;

  return (
    <button
      id={key}
      type="button"
      onMouseEnter={() => onSelect(key)}
      onClick={() => onOpen(action.href)}
      className={commandItemClass(selected, "emerald")}
    >
      <span className="min-w-0">
        <span className="flex flex-wrap items-center gap-2">
          <RepairBadge tone="emerald">Rápida</RepairBadge>
          {action.shortcut ? (
            <span className="rounded-full border border-white/10 bg-black/40 px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.12em] text-zinc-400">
              {action.shortcut}
            </span>
          ) : null}
        </span>
        <span className="mt-2 block break-words text-sm font-black text-zinc-50">
          {action.label}
        </span>
        <span className="mt-1 block break-words text-xs leading-5 text-zinc-400">
          {action.description}
        </span>
      </span>
      <span className="shrink-0 rounded-full border border-white/10 bg-black/40 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-zinc-400 group-hover:text-emerald-100">
        Abrir
      </span>
    </button>
  );
}

function CommandSection({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) {
  return (
    <section className="grid gap-2">
      <h3 className="px-1 text-[11px] font-black uppercase tracking-[0.18em] text-zinc-500">
        {title}
      </h3>
      {children}
    </section>
  );
}

function SearchResultSection({
  category,
  onOpen,
  onSelect,
  results,
  selectedKey,
}: {
  category: GlobalSearchCategory;
  onOpen: (href: string) => void;
  onSelect: (key: string) => void;
  results: GlobalSearchResult[];
  selectedKey?: string;
}) {
  return (
    <section className="grid gap-2">
      <p className="px-1 text-[11px] font-black uppercase tracking-[0.16em] text-cyan-200">
        {searchCategoryLabels[category]}
      </p>
      <ul className="grid gap-2">
        {results.map((result) => (
          <li key={`${result.category}-${result.id}`}>
            <button
              id={searchResultKey(result)}
              type="button"
              onMouseEnter={() => onSelect(searchResultKey(result))}
              onClick={() => onOpen(result.href)}
              className={commandItemClass(selectedKey === searchResultKey(result), "emerald")}
            >
              <span className="min-w-0">
                <span className="flex flex-wrap items-center gap-2">
                  <RepairBadge tone={categoryTone(category)}>
                    {resultLabel(category)}
                  </RepairBadge>
                  {result.meta ? (
                    <span className="text-xs font-bold text-zinc-500">{result.meta}</span>
                  ) : null}
                </span>
                <span className="mt-2 block break-words text-sm font-black text-zinc-50">
                  {result.label}
                </span>
                <span className="mt-1 block break-words text-xs leading-5 text-zinc-400">
                  {result.description}
                </span>
              </span>
              <span className="shrink-0 rounded-full border border-white/10 bg-black/40 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-zinc-400 group-hover:text-emerald-100">
                Abrir
              </span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

function resultLabel(category: GlobalSearchCategory) {
  const labels: Record<GlobalSearchCategory, string> = {
    tickets: "Ticket",
    customers: "Cliente",
    messages: "Mensaje",
  };

  return labels[category];
}

function categoryTone(category: GlobalSearchCategory) {
  const tones: Record<GlobalSearchCategory, "cyan" | "emerald" | "violet"> = {
    tickets: "cyan",
    customers: "emerald",
    messages: "violet",
  };

  return tones[category];
}

function commandItemClass(selected: boolean, accent: "cyan" | "emerald" = "cyan") {
  const selectedClass =
    accent === "emerald"
      ? "border-emerald-300/35 bg-white/[0.075]"
      : "border-cyan-300/35 bg-white/[0.075]";
  const hoverClass =
    accent === "emerald"
      ? "hover:border-emerald-300/30 hover:bg-emerald-500/10"
      : "hover:border-cyan-300/30 hover:bg-cyan-500/10";

  return `repair-focus-ring group flex w-full items-start justify-between gap-4 rounded-2xl border p-4 text-left transition disabled:cursor-not-allowed disabled:opacity-55 ${
    selected ? selectedClass : `border-white/10 bg-zinc-950/70 ${hoverClass}`
  }`;
}

function searchResultKey(result: Pick<GlobalSearchResult, "category" | "id">) {
  return `search:${result.category}:${result.id}`;
}

function indexForKey(items: SelectableCommandItem[], key: string) {
  const index = items.findIndex((item) => item.key === key);
  return index >= 0 ? index : 0;
}
