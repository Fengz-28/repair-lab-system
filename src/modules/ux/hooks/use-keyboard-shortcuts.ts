"use client";

import { useEffect, useRef, type MutableRefObject } from "react";

import {
  KEYBOARD_SEQUENCE_TIMEOUT_MS,
  keyboardShortcuts,
} from "@/modules/ux/lib/keyboard-shortcuts";

type KeyboardShortcutOptions = {
  enabled?: boolean;
  onNavigate: (href: string) => void;
  onOpenCommandPalette: () => void;
};

export function useKeyboardShortcuts({
  enabled = true,
  onNavigate,
  onOpenCommandPalette,
}: KeyboardShortcutOptions) {
  const sequenceRef = useRef<string | null>(null);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled) {
      clearSequence(timeoutRef);
      sequenceRef.current = null;
      return;
    }

    function onKeyDown(event: KeyboardEvent) {
      if (shouldIgnoreShortcut(event)) {
        return;
      }

      const key = event.key.toLowerCase();

      if (key === "/") {
        event.preventDefault();
        clearSequence(timeoutRef);
        sequenceRef.current = null;
        onOpenCommandPalette();
        return;
      }

      if (key === "g") {
        sequenceRef.current = "g";
        scheduleSequenceClear(sequenceRef, timeoutRef);
        return;
      }

      if (sequenceRef.current === "g") {
        const shortcut = keyboardShortcuts.find((item) => {
          return item.keys.length === 2 && item.keys[0] === "g" && item.keys[1] === key;
        });

        clearSequence(timeoutRef);
        sequenceRef.current = null;

        if (shortcut?.href) {
          event.preventDefault();
          onNavigate(shortcut.href);
        }
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      clearSequence(timeoutRef);
    };
  }, [enabled, onNavigate, onOpenCommandPalette]);
}

function shouldIgnoreShortcut(event: KeyboardEvent) {
  if (event.defaultPrevented || event.ctrlKey || event.metaKey || event.altKey) {
    return true;
  }

  const target = event.target;

  if (target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target instanceof HTMLSelectElement ||
    (target instanceof HTMLElement && target.isContentEditable)) {
    return true;
  }

  const activeElement = document.activeElement;

  return activeElement instanceof HTMLElement && Boolean(activeElement.closest("form"));
}

function scheduleSequenceClear(
  sequenceRef: MutableRefObject<string | null>,
  timeoutRef: MutableRefObject<number | null>,
) {
  clearSequence(timeoutRef);
  timeoutRef.current = window.setTimeout(() => {
    sequenceRef.current = null;
    timeoutRef.current = null;
  }, KEYBOARD_SEQUENCE_TIMEOUT_MS);
}

function clearSequence(timeoutRef: MutableRefObject<number | null>) {
  if (timeoutRef.current !== null) {
    window.clearTimeout(timeoutRef.current);
    timeoutRef.current = null;
  }
}
