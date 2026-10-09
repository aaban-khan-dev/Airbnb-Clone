"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { api } from "@/lib/api";
import { filtersToQuery, type SearchFilters } from "@/lib/search";
import type { ListingCard, ListingPage } from "@/lib/types";

function fetchPage(query: string, page: number): Promise<ListingPage> {
  const separator = query ? "&" : "";
  return api.get<ListingPage>(`/api/listings?${query}${separator}page=${page}`);
}

function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : "Something went wrong";
}

/**
 * Loads search results page by page.
 * The component using this is re-mounted (via a React `key`) whenever the
 * filters change, so every new search starts from page 1 with empty state.
 */
export function useListingSearch(filters: SearchFilters) {
  const query = filtersToQuery(filters);

  const [items, setItems] = useState<ListingCard[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0); // last page loaded
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true); // true: page 1 starts loading on mount
  const [error, setError] = useState<string | null>(null);
  const inFlight = useRef(true); // prevents loading the same page twice

  function applyPage(result: ListingPage) {
    setItems((prev) => (result.page === 1 ? result.items : [...prev, ...result.items]));
    setTotal(result.total);
    setPage(result.page);
    setHasMore(result.has_more);
    setError(null);
  }

  // Page 1, once, when the component mounts
  useEffect(() => {
    let cancelled = false; // ignore the response if the component unmounted meanwhile
    fetchPage(query, 1)
      .then((result) => !cancelled && applyPage(result))
      .catch((err) => !cancelled && setError(errorMessage(err)))
      .finally(() => {
        inFlight.current = false;
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [query]);

  // Next pages, triggered by infinite scroll (or "Try again" after an error)
  const loadNext = useCallback(async () => {
    if (inFlight.current) return;
    inFlight.current = true;
    setLoading(true);
    try {
      applyPage(await fetchPage(query, page + 1));
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      inFlight.current = false;
      setLoading(false);
    }
  }, [query, page]);

  const loadMore = useCallback(() => {
    if (hasMore && !error) void loadNext();
  }, [hasMore, error, loadNext]);

  return { items, total, hasMore, loading, error, loadMore, retry: loadNext };
}
