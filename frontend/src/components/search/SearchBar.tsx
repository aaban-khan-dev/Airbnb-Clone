"use client";

import { Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo, useRef, useState } from "react";

import { DesktopSearchPanel } from "@/components/search/DesktopSearchPanel";
import { MobileSearchSheet } from "@/components/search/MobileSearchSheet";
import type { DateRange } from "@/components/ui/DateRangeCalendar";
import { useClickOutside } from "@/hooks/useClickOutside";
import { formatDateRange, fromISODate, plural, toISODate } from "@/lib/format";
import { filtersToQuery, parseFilters } from "@/lib/search";

export type Section = "where" | "dates" | "guests";

/** The draft search the user is editing; applied to the URL only when they press Search. */
export type SearchDraft = {
  location: string;
  range: DateRange;
  adults: number;
  children: number;
};

/**
 * Airbnb's search. A compact pill in the navbar opens either a dropdown panel
 * (desktop) or a full-screen sheet (mobile). Both edit the same draft, and
 * submitting writes the search into the URL, which the home page reads.
 */
export function SearchBar({ expanded = false }: { expanded?: boolean }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const current = parseFilters(searchParams);

  const [open, setOpen] = useState(false);
  const [section, setSection] = useState<Section>("where");
  const [draft, setDraft] = useState<SearchDraft>({
    location: "",
    range: { from: null, to: null },
    adults: 0,
    children: 0,
  });
  const rootRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => setOpen(false), []);
  const refs = useMemo(() => [rootRef, sheetRef], []);
  useClickOutside(refs, close, open); // close on outside click or Escape

  function openAt(target: Section) {
    // Start the draft from whatever is currently in the URL
    setDraft({
      location: current.location ?? "",
      range: {
        from: current.checkIn ? fromISODate(current.checkIn) : null,
        to: current.checkOut ? fromISODate(current.checkOut) : null,
      },
      adults: current.guests ?? 0,
      children: 0,
    });
    setSection(target);
    setOpen(true);
  }

  function submit() {
    const guests = draft.adults + draft.children;
    const { from, to } = draft.range;
    const query = filtersToQuery({
      ...current, // keep category and filters
      location: draft.location.trim() || undefined,
      checkIn: from && to ? toISODate(from) : undefined,
      checkOut: from && to ? toISODate(to) : undefined,
      guests: guests > 0 ? guests : undefined,
    });
    setOpen(false);
    router.push(query ? `/?${query}` : "/");
  }

  // Text shown in the compact pills
  const whereLabel = current.location || "Anywhere";
  const datesLabel =
    current.checkIn && current.checkOut ? formatDateRange(current.checkIn, current.checkOut) : "Any week";
  const guestsLabel = current.guests ? plural(current.guests, "guest") : "Add guests";

  const panelProps = { draft, setDraft, section, setSection, onSubmit: submit };

  return (
    <div ref={rootRef} className="relative w-full md:w-auto">
      {/* Mobile pill: one full-width "Where to?" button */}
      <button
        type="button"
        onClick={() => openAt("where")}
        className="flex w-full items-center gap-3 rounded-full border border-line px-4 py-2 text-left shadow-pill md:hidden"
      >
        <Search size={18} strokeWidth={2.5} />
        <span className="min-w-0">
          <span className="block truncate text-sm font-semibold">{current.location || "Where to?"}</span>
          <span className="block truncate text-xs text-muted">
            {datesLabel} · {guestsLabel}
          </span>
        </span>
      </button>

      {/* Desktop compact pill. In the tall header it fades out and the big bar takes over. */}
      <button
        type="button"
        onClick={() => openAt("where")}
        tabIndex={expanded ? -1 : 0}
        aria-hidden={expanded}
        className={`hidden items-center rounded-full border border-line bg-canvas py-2 pl-6 pr-2 text-sm shadow-pill transition-all duration-300 hover:shadow-card md:flex ${
          open || expanded ? "pointer-events-none md:opacity-0" : ""
        } ${expanded ? "translate-y-6 scale-125" : ""}`}
      >
        <span className="max-w-32 truncate font-semibold">{whereLabel}</span>
        <span className="mx-4 h-6 w-px bg-line" />
        <span
          className="font-semibold"
          onClick={(e) => {
            e.stopPropagation();
            openAt("dates");
          }}
        >
          {datesLabel}
        </span>
        <span className="mx-4 h-6 w-px bg-line" />
        <span
          className={current.guests ? "font-semibold" : "text-muted"}
          onClick={(e) => {
            e.stopPropagation();
            openAt("guests");
          }}
        >
          {guestsLabel}
        </span>
        <span className="ml-4 flex h-8 w-8 items-center justify-center rounded-full bg-brand text-white">
          <Search size={14} strokeWidth={3} />
        </span>
      </button>

      {/* Desktop big bar (top of the home page). On scroll it shrinks up into the pill above. */}
      <div
        aria-hidden={!expanded}
        className={`absolute left-1/2 top-[84px] hidden w-[850px] max-w-[calc(100vw-80px)] origin-top -translate-x-1/2 transition-all duration-300 md:block ${
          expanded && !open ? "opacity-100" : "pointer-events-none -translate-y-[76px] scale-x-[0.45] scale-y-[0.7] opacity-0"
        }`}
      >
        <div className="flex h-16 items-center rounded-full border border-line bg-canvas shadow-card">
          <BigSegment label="Where" value={current.location} placeholder="Search destinations" onClick={() => openAt("where")} className="flex-[1.3] pl-8" />
          <span className="h-8 w-px bg-line" />
          <BigSegment
            label="When"
            value={current.checkIn && current.checkOut ? formatDateRange(current.checkIn, current.checkOut) : undefined}
            placeholder="Add dates"
            onClick={() => openAt("dates")}
            className="flex-1"
          />
          <span className="h-8 w-px bg-line" />
          <BigSegment
            label="Who"
            value={current.guests ? plural(current.guests, "guest") : undefined}
            placeholder="Add guests"
            onClick={() => openAt("guests")}
            className="flex-1"
          />
          <button
            type="button"
            tabIndex={expanded ? 0 : -1}
            aria-label="Search"
            onClick={() => openAt("where")}
            className="mr-2 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand text-white hover:bg-brand-dark"
          >
            <Search size={18} strokeWidth={3} />
          </button>
        </div>
      </div>

      {open && (
        <>
          <DesktopSearchPanel {...panelProps} expanded={expanded} />
          <MobileSearchSheet {...panelProps} sheetRef={sheetRef} onClose={close} />
        </>
      )}
    </div>
  );
}

function BigSegment({
  label,
  value,
  placeholder,
  onClick,
  className = "",
}: {
  label: string;
  value: string | undefined;
  placeholder: string;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`h-full rounded-full px-6 text-left hover:bg-surface ${className}`}
    >
      <span className="block text-xs font-semibold">{label}</span>
      <span className={`block truncate text-sm ${value ? "font-semibold" : "text-muted"}`}>{value || placeholder}</span>
    </button>
  );
}
