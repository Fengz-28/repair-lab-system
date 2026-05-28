"use client";

import { useEffect, useMemo, useState } from "react";

import { filterCommandActions } from "@/modules/ux/lib/command-actions";

export function useCommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  function close() {
    setOpen(false);
    setQuery("");
  }

  function openPalette() {
    setOpen(true);
  }

  function togglePalette() {
    setOpen((current) => {
      const nextOpen = !current;
      if (!nextOpen) {
        setQuery("");
      }

      return nextOpen;
    });
  }

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const target = event.target;
      const isTypingTarget =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement ||
        (target instanceof HTMLElement && target.isContentEditable);

      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        togglePalette();
        return;
      }

      if (event.key === "Escape") {
        close();
        return;
      }

      if (isTypingTarget) {
        return;
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const actions = useMemo(() => filterCommandActions(query), [query]);

  return {
    actions,
    close,
    open,
    openPalette,
    query,
    setQuery,
  };
}
