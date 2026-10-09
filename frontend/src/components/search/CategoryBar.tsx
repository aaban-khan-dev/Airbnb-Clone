"use client";

import { SlidersHorizontal } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import { FiltersModal } from "@/components/search/FiltersModal";
import { Container } from "@/components/ui/Container";
import { CATEGORY_ICONS } from "@/lib/categories";
import { countActiveFilters, filtersToQuery, parseFilters } from "@/lib/search";

// The row of category icons under the navbar, plus the "Filters" button
export function CategoryBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const filters = parseFilters(searchParams);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const activeCount = countActiveFilters(filters);

  function selectCategory(category: string) {
    // Clicking the selected category again clears it
    const next = { ...filters, category: filters.category === category ? undefined : category };
    const query = filtersToQuery(next);
    router.push(query ? `/?${query}` : "/", { scroll: false });
  }

  return (
    <div className="sticky top-20 z-20 bg-white shadow-[0_1px_0_rgba(0,0,0,0.08)]">
      <Container className="flex items-center gap-6 pt-4">
        <div className="no-scrollbar flex flex-1 gap-8 overflow-x-auto">
          {Object.entries(CATEGORY_ICONS).map(([name, Icon]) => {
            const selected = filters.category === name;
            return (
              <button
                key={name}
                type="button"
                onClick={() => selectCategory(name)}
                aria-pressed={selected}
                className={`flex shrink-0 flex-col items-center gap-2 border-b-2 pb-3 text-xs font-semibold transition-colors ${
                  selected
                    ? "border-ink text-ink"
                    : "border-transparent text-muted hover:border-line hover:text-ink"
                }`}
              >
                <Icon size={24} strokeWidth={1.6} />
                <span className="whitespace-nowrap">{name}</span>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => setFiltersOpen(true)}
          className="mb-3 flex shrink-0 items-center gap-2 rounded-xl border border-line px-4 py-3 text-xs font-semibold hover:border-ink"
        >
          <SlidersHorizontal size={16} />
          Filters
          {activeCount > 0 && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-ink text-[10px] text-white">
              {activeCount}
            </span>
          )}
        </button>
      </Container>

      <FiltersModal open={filtersOpen} onClose={() => setFiltersOpen(false)} filters={filters} />
    </div>
  );
}
