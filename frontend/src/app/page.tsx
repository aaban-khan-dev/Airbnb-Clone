"use client";

import { List, Map as MapIcon } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

import { ListingResults } from "@/components/listings/ListingResults";
import { MapResults } from "@/components/listings/MapResults";
import { CategoryBar } from "@/components/search/CategoryBar";
import { Container } from "@/components/ui/Container";
import { filtersToQuery, parseFilters } from "@/lib/search";

// useSearchParams needs a Suspense boundary so Next.js can pre-render the page shell
export default function HomePage() {
  return (
    <Suspense>
      <Home />
    </Suspense>
  );
}

function Home() {
  const searchParams = useSearchParams();
  const filters = parseFilters(searchParams);
  const query = filtersToQuery(filters);
  const [showMap, setShowMap] = useState(false);

  return (
    <>
      <CategoryBar />
      <Container>
        {/* A new key whenever the search changes = fresh results, starting at page 1 */}
        {showMap ? (
          <MapResults key={query} filters={filters} />
        ) : (
          <ListingResults key={query} filters={filters} />
        )}
      </Container>

      {/* Airbnb's floating "Show map / Show list" switch */}
      <button
        type="button"
        onClick={() => setShowMap((v) => !v)}
        className="fixed bottom-24 left-1/2 z-30 flex -translate-x-1/2 items-center gap-2 rounded-full bg-ink px-5 py-3.5 text-sm font-semibold text-canvas shadow-card transition-transform hover:scale-105 md:bottom-10"
      >
        {showMap ? (
          <>
            Show list <List size={16} />
          </>
        ) : (
          <>
            Show map <MapIcon size={16} />
          </>
        )}
      </button>
    </>
  );
}
