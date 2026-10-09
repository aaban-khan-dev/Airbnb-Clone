"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { AmenityIcon } from "@/components/ui/AmenityIcon";
import { Modal } from "@/components/ui/Modal";
import { api } from "@/lib/api";
import { formatPrice } from "@/lib/format";
import { filtersToQuery, type SearchFilters } from "@/lib/search";
import type { FilterOptions, ListingPage } from "@/lib/types";

export function FiltersModal({
  open,
  onClose,
  filters,
}: {
  open: boolean;
  onClose: () => void;
  filters: SearchFilters;
}) {
  if (!open) return null;
  // Mounting the inner component only while open means its draft state
  // starts fresh from the current filters every time the modal opens
  return <FiltersModalContent onClose={onClose} filters={filters} />;
}

function FiltersModalContent({ onClose, filters }: { onClose: () => void; filters: SearchFilters }) {
  const router = useRouter();
  const [options, setOptions] = useState<FilterOptions | null>(null);
  const [draft, setDraft] = useState<SearchFilters>(filters);
  const [matchCount, setMatchCount] = useState<number | null>(null);

  // Load the available filter options once
  useEffect(() => {
    api.get<FilterOptions>("/api/listings/filters").then(setOptions).catch(() => setOptions(null));
  }, []);

  // Live "Show N places" count. The short delay avoids a request on every keystroke.
  useEffect(() => {
    const timer = setTimeout(() => {
      api
        .get<ListingPage>(`/api/listings?${filtersToQuery(draft)}&page_size=1`)
        .then((page) => setMatchCount(page.total))
        .catch(() => setMatchCount(null));
    }, 300);
    return () => clearTimeout(timer);
  }, [draft]);

  function toggle<T>(list: T[], item: T): T[] {
    return list.includes(item) ? list.filter((x) => x !== item) : [...list, item];
  }

  function apply() {
    const query = filtersToQuery(draft);
    router.push(query ? `/?${query}` : "/", { scroll: false });
    onClose();
  }

  function clearAll() {
    setDraft({ ...draft, propertyTypes: [], amenityIds: [], minPrice: undefined, maxPrice: undefined });
  }

  const parsePrice = (value: string) => (value === "" ? undefined : Math.max(0, Number(value)));

  return (
    <Modal
      open
      onClose={onClose}
      title="Filters"
      footer={
        <div className="flex items-center justify-between">
          <button type="button" onClick={clearAll} className="font-semibold underline">
            Clear all
          </button>
          <button
            type="button"
            onClick={apply}
            className="rounded-lg bg-ink px-6 py-3 font-semibold text-canvas hover:opacity-90"
          >
            {matchCount === null ? "Show places" : `Show ${matchCount} place${matchCount === 1 ? "" : "s"}`}
          </button>
        </div>
      }
    >
      <section className="border-b border-line pb-8">
        <h3 className="text-xl font-semibold">Price range</h3>
        <p className="mt-1 text-sm text-muted">
          Nightly prices before fees
          {options && ` · from ${formatPrice(options.min_price)} to ${formatPrice(options.max_price)}`}
        </p>
        <div className="mt-6 flex items-center gap-4">
          <PriceInput
            label="Minimum"
            value={draft.minPrice}
            placeholder={options?.min_price}
            onChange={(v) => setDraft({ ...draft, minPrice: parsePrice(v) })}
          />
          <span className="text-muted">–</span>
          <PriceInput
            label="Maximum"
            value={draft.maxPrice}
            placeholder={options?.max_price}
            onChange={(v) => setDraft({ ...draft, maxPrice: parsePrice(v) })}
          />
        </div>
      </section>

      <section className="border-b border-line py-8">
        <h3 className="text-xl font-semibold">Property type</h3>
        <div className="mt-4 flex flex-wrap gap-3">
          {options?.property_types.map((type) => (
            <Pill
              key={type}
              selected={draft.propertyTypes.includes(type)}
              onClick={() => setDraft({ ...draft, propertyTypes: toggle(draft.propertyTypes, type) })}
            >
              {type}
            </Pill>
          ))}
        </div>
      </section>

      <section className="pt-8">
        <h3 className="text-xl font-semibold">Amenities</h3>
        <div className="mt-4 flex flex-wrap gap-3">
          {options?.amenities.map((amenity) => (
            <Pill
              key={amenity.id}
              selected={draft.amenityIds.includes(amenity.id)}
              onClick={() => setDraft({ ...draft, amenityIds: toggle(draft.amenityIds, amenity.id) })}
            >
              <AmenityIcon iconKey={amenity.icon} size={18} strokeWidth={1.6} />
              {amenity.name}
            </Pill>
          ))}
        </div>
      </section>
    </Modal>
  );
}

function PriceInput({
  label,
  value,
  placeholder,
  onChange,
}: {
  label: string;
  value: number | undefined;
  placeholder?: number;
  onChange: (value: string) => void;
}) {
  return (
    <label className="flex-1 rounded-xl border border-line px-4 py-2 focus-within:border-ink">
      <span className="block text-xs text-muted">{label}</span>
      <span className="flex items-center gap-1">
        ₹
        <input
          type="number"
          min={0}
          value={value ?? ""}
          placeholder={placeholder?.toString()}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-transparent outline-none"
        />
      </span>
    </label>
  );
}

function Pill({
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
      className={`flex items-center gap-2 rounded-full border px-5 py-3 text-sm ${
        selected ? "border-ink bg-surface font-semibold ring-1 ring-ink" : "border-line hover:border-ink"
      }`}
    >
      {children}
    </button>
  );
}
