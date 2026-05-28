"use client";

import { useEffect, useMemo, useState } from "react";

import {
  globalSearch,
  type GlobalSearchResponse,
} from "@/modules/ux/search/global-search";

const MIN_QUERY_LENGTH = 2;
const DEBOUNCE_MS = 250;

type GlobalSearchState = {
  data: GlobalSearchResponse | null;
  error: string | null;
  loading: boolean;
};

export function useGlobalSearch(query: string) {
  const trimmedQuery = query.trim();
  const enabled = trimmedQuery.length >= MIN_QUERY_LENGTH;
  const [state, setState] = useState<GlobalSearchState>({
    data: null,
    error: null,
    loading: false,
  });

  useEffect(() => {
    if (!enabled) {
      return;
    }

    let cancelled = false;
    const timeoutId = window.setTimeout(() => {
      setState((current) => ({ ...current, error: null, loading: true }));

      globalSearch(trimmedQuery)
        .then((data) => {
          if (!cancelled) {
            setState({ data, error: null, loading: false });
          }
        })
        .catch(() => {
          if (!cancelled) {
            setState({
              data: null,
              error: "No se pudo completar la busqueda global.",
              loading: false,
            });
          }
        });
    }, DEBOUNCE_MS);

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [enabled, trimmedQuery]);

  return useMemo(
    () => ({
      ...state,
      enabled,
    }),
    [enabled, state],
  );
}
