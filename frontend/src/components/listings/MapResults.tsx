"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

import { MapSkeleton } from "@/components/map/MapSkeleton";
import { api } from "@/lib/api";
import { filtersToQuery, type SearchFilters } from "@/lib/search";
import type { ListingPage } from "@/lib/types";

const ListingsMap = dynamic(() => import("@/components/map/ListingsMap"), {
  ssr: false,
  loading: () => <MapSkeleton />,
});

const MAP_LIMIT = 50; // the API's maximum page size

/** The "Show map" view: all results for the current search as price pins. */
export function MapResults({ filters }: { filters: SearchFilters }) {
  const [page, setPage] = useState<ListingPage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const query = filtersToQuery(filters);

  useEffect(() => {
    api
      .get<ListingPage>(`/api/listings?${query}${query ? "&" : ""}page_size=${MAP_LIMIT}`)
      .then(setPage)
      .catch((err: Error) => setError(err.message));
  }, [query]);

  const linkQuery =
    filters.checkIn && filters.checkOut ? `?check_in=${filters.checkIn}&check_out=${filters.checkOut}` : "";

  return (
    <div className="pt-6">
      {page && (
        <p className="mb-4 text-sm font-semibold">
          {page.total === 0
            ? "No stays match this search"
            : page.total > MAP_LIMIT
              ? `Showing ${MAP_LIMIT} of ${page.total} stays`
              : `${page.total} stay${page.total === 1 ? "" : "s"}`}
        </p>
      )}
      {error && <p className="mb-4 text-muted">Couldn&apos;t load the map: {error}</p>}
      <div className="h-[calc(100vh-260px)] min-h-[420px]">
        {page ? <ListingsMap listings={page.items} linkQuery={linkQuery} /> : <MapSkeleton />}
      </div>
    </div>
  );
}
