"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

import { ListingCard, ListingCardSkeleton } from "@/components/listings/ListingCard";
import { useListingSearch } from "@/hooks/useListingSearch";
import { plural } from "@/lib/format";
import type { SearchFilters } from "@/lib/search";

// Grid of results with infinite scroll: when the invisible "sentinel" div below
// the grid scrolls into view, the next page is loaded and appended.
export function ListingResults({ filters }: { filters: SearchFilters }) {
  const { items, total, hasMore, loading, error, loadMore, retry } = useListingSearch(filters);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) loadMore();
      },
      { rootMargin: "400px" }, // start loading a little before the user reaches the end
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadMore]);

  const isFirstLoad = loading && items.length === 0;
  const isSearching = Boolean(
    filters.location || filters.checkIn || filters.guests || filters.category ||
      filters.propertyTypes.length || filters.amenityIds.length ||
      filters.minPrice !== undefined || filters.maxPrice !== undefined,
  );

  if (!loading && !error && items.length === 0) {
    return (
      <div className="py-16">
        <h2 className="text-2xl font-semibold">No exact matches</h2>
        <p className="mt-2 text-muted">
          Try changing or removing some of your filters or adjusting your search area.
        </p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-lg border border-ink px-6 py-3 font-semibold hover:bg-surface"
        >
          Remove all filters
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-6">
      {isSearching && !isFirstLoad && (
        <p className="mb-6 text-sm font-semibold">{plural(total, "stay")}</p>
      )}

      <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
        {items.map((listing) => (
          <ListingCard
            key={listing.id}
            listing={listing}
            checkIn={filters.checkIn}
            checkOut={filters.checkOut}
          />
        ))}
        {loading && Array.from({ length: 8 }, (_, i) => <ListingCardSkeleton key={`skeleton-${i}`} />)}
      </div>

      {error && (
        <div className="mt-10 text-center">
          <p className="text-muted">Couldn&apos;t load stays: {error}</p>
          <button type="button" onClick={retry} className="mt-3 font-semibold underline">
            Try again
          </button>
        </div>
      )}

      {hasMore && !error && <div ref={sentinelRef} className="h-px" />}
      {!hasMore && items.length > 0 && (
        <p className="mt-12 text-center text-sm text-muted">You&apos;ve seen all {plural(total, "stay")}</p>
      )}
    </div>
  );
}
