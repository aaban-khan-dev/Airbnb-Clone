"use client";

import { Ellipsis, SlidersHorizontal, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useRef, useState } from "react";

import { FiltersModal } from "@/components/search/FiltersModal";
import { Container } from "@/components/ui/Container";
import { useClickOutside } from "@/hooks/useClickOutside";
import { CATEGORY_ICONS } from "@/lib/categories";
import { countActiveFilters, filtersToQuery, parseFilters } from "@/lib/search";

/**
 * Slim row above the results: a "⋯" menu for browsing by category on the left,
 * and the Filters button (price, property type, amenities) on the right.
 * Categories live in a menu because Airbnb's current home page no longer shows
 * the big icon row, but browsing by category is still useful.
 */
export function CategoryBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const filters = parseFilters(searchParams);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const closeMenu = useCallback(() => setMenuOpen(false), [setMenuOpen]);
  useClickOutside(menuRef, closeMenu, menuOpen);

  const activeCount = countActiveFilters(filters);
  const ActiveIcon = filters.category ? CATEGORY_ICONS[filters.category] : null;

  function selectCategory(category: string | undefined) {
    const query = filtersToQuery({ ...filters, category });
    router.push(query ? `/?${query}` : "/", { scroll: false });
    setMenuOpen(false);
  }

  return (
    <Container className="flex items-center justify-between gap-3 pt-6">
      <div className="flex items-center gap-2">
        <div ref={menuRef} className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label="Browse by category"
            aria-expanded={menuOpen}
            title="Browse by category"
            className={`flex h-10 w-10 items-center justify-center rounded-full border transition-colors ${
              menuOpen ? "border-ink bg-surface" : "border-line hover:border-ink"
            }`}
          >
            <Ellipsis size={18} />
          </button>

          {menuOpen && (
            <div className="absolute left-0 z-30 mt-2 w-64 overflow-hidden rounded-xl bg-canvas py-2 shadow-card ring-1 ring-line">
              <p className="px-4 pb-2 pt-1 text-xs font-semibold uppercase tracking-wide text-muted">
                Browse by category
              </p>
              <MenuItem selected={!filters.category} onClick={() => selectCategory(undefined)}>
                All stays
              </MenuItem>
              {Object.entries(CATEGORY_ICONS).map(([name, Icon]) => (
                <MenuItem key={name} selected={filters.category === name} onClick={() => selectCategory(name)}>
                  <Icon size={20} strokeWidth={1.6} />
                  {name}
                </MenuItem>
              ))}
            </div>
          )}
        </div>

        {/* The chosen category, with an x to clear it */}
        {filters.category && ActiveIcon && (
          <span className="flex items-center gap-2 rounded-full border border-ink bg-surface py-2 pl-3 pr-2 text-sm font-semibold">
            <ActiveIcon size={16} strokeWidth={1.8} />
            {filters.category}
            <button
              type="button"
              aria-label={`Remove ${filters.category}`}
              onClick={() => selectCategory(undefined)}
              className="rounded-full p-0.5 hover:bg-line"
            >
              <X size={14} />
            </button>
          </span>
        )}
      </div>

      <button
        type="button"
        onClick={() => setFiltersOpen(true)}
        aria-label="Filters"
        className="flex shrink-0 items-center gap-2 rounded-xl border border-line px-3 py-2.5 text-xs font-semibold hover:border-ink sm:px-4"
      >
        <SlidersHorizontal size={16} />
        <span className="hidden sm:inline">Filters</span>
        {activeCount > 0 && (
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-ink text-[10px] text-canvas">
            {activeCount}
          </span>
        )}
      </button>

      <FiltersModal open={filtersOpen} onClose={() => setFiltersOpen(false)} filters={filters} />
    </Container>
  );
}

function MenuItem({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm hover:bg-surface ${
        selected ? "font-semibold" : ""
      }`}
    >
      {children}
    </button>
  );
}
