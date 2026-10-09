"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

import { ListingResults } from "@/components/listings/ListingResults";
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

  return (
    <>
      <CategoryBar />
      <Container>
        {/* A new key whenever the search changes = fresh results, starting at page 1 */}
        <ListingResults key={filtersToQuery(filters)} filters={filters} />
      </Container>
    </>
  );
}
