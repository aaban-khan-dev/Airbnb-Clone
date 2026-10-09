"use client";

import { MapPin, Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useRef, useState } from "react";

import { Counter } from "@/components/ui/Counter";
import { type DateRange, DateRangeCalendar } from "@/components/ui/DateRangeCalendar";
import { useClickOutside } from "@/hooks/useClickOutside";
import { formatDateRange, fromISODate, plural, toISODate } from "@/lib/format";
import { filtersToQuery, parseFilters, POPULAR_DESTINATIONS } from "@/lib/search";

type Section = "where" | "dates" | "guests";

/**
 * Airbnb's search: a compact pill in the navbar that expands into a full bar
 * (Where / Check in / Check out / Who) with a popover for the active section.
 * Submitting writes the search into the URL, and the home page reads it from there.
 */
export function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const current = parseFilters(searchParams);

  const [open, setOpen] = useState(false);
  const [section, setSection] = useState<Section>("where");
  // Draft values: only applied to the URL when the user presses Search
  const [location, setLocation] = useState("");
  const [range, setRange] = useState<DateRange>({ from: null, to: null });
  const [adults, setAdults] = useState(0);
  const [children, setChildren] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => setOpen(false), []);
  useClickOutside(rootRef, close, open); // close on outside click or Escape

  function openAt(target: Section) {
    // Start the draft from whatever is currently in the URL
    setLocation(current.location ?? "");
    setRange({
      from: current.checkIn ? fromISODate(current.checkIn) : null,
      to: current.checkOut ? fromISODate(current.checkOut) : null,
    });
    setAdults(current.guests ?? 0);
    setChildren(0);
    setSection(target);
    setOpen(true);
  }

  function submit() {
    const guests = adults + children;
    const hasDates = range.from !== null && range.to !== null;
    const query = filtersToQuery({
      ...current, // keep category and filters
      location: location.trim() || undefined,
      checkIn: hasDates ? toISODate(range.from!) : undefined,
      checkOut: hasDates ? toISODate(range.to!) : undefined,
      guests: guests > 0 ? guests : undefined,
    });
    setOpen(false);
    router.push(query ? `/?${query}` : "/");
  }

  // Text shown in the compact pill
  const whereLabel = current.location || "Anywhere";
  const datesLabel =
    current.checkIn && current.checkOut ? formatDateRange(current.checkIn, current.checkOut) : "Any week";
  const guestsLabel = current.guests ? plural(current.guests, "guest") : "Add guests";

  const draftGuests = adults + children;

  return (
    <div ref={rootRef} className="relative">
      {/* Compact pill */}
      <button
        type="button"
        onClick={() => openAt("where")}
        className={`flex items-center rounded-full border border-line py-2 pl-6 pr-2 text-sm shadow-pill transition-shadow hover:shadow-card ${
          open ? "invisible" : ""
        }`}
      >
        <span className="max-w-32 truncate font-semibold">{whereLabel}</span>
        <span className="mx-4 hidden h-6 w-px bg-line sm:block" />
        <span
          className="hidden font-semibold sm:block"
          onClick={(e) => {
            e.stopPropagation();
            openAt("dates");
          }}
        >
          {datesLabel}
        </span>
        <span className="mx-4 hidden h-6 w-px bg-line sm:block" />
        <span
          className={`hidden sm:block ${current.guests ? "font-semibold" : "text-muted"}`}
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

      {open && (
        <>
          {/* Dim the page below the header */}
          <div className="fixed inset-x-0 bottom-0 top-20 z-30 bg-black/25" />

          <div className="absolute left-1/2 top-[-4px] z-50 w-[min(800px,94vw)] -translate-x-1/2">
            {/* Expanded bar */}
            <div className="flex items-center rounded-full border border-line bg-surface text-sm shadow-card">
              <Segment active={section === "where"} onClick={() => setSection("where")} className="flex-[1.4]">
                <span className="block text-xs font-semibold">Where</span>
                <input
                  autoFocus
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  onFocus={() => setSection("where")}
                  onKeyDown={(e) => e.key === "Enter" && submit()}
                  placeholder="Search destinations"
                  className="w-full bg-transparent text-sm outline-none placeholder:text-muted"
                />
              </Segment>
              <Segment active={section === "dates"} onClick={() => setSection("dates")} className="flex-1">
                <span className="block text-xs font-semibold">Check in</span>
                <span className={range.from ? "" : "text-muted"}>
                  {range.from ? toShortDate(range.from) : "Add dates"}
                </span>
              </Segment>
              <Segment active={section === "dates"} onClick={() => setSection("dates")} className="flex-1">
                <span className="block text-xs font-semibold">Check out</span>
                <span className={range.to ? "" : "text-muted"}>
                  {range.to ? toShortDate(range.to) : "Add dates"}
                </span>
              </Segment>
              <Segment
                active={section === "guests"}
                onClick={() => setSection("guests")}
                className="flex flex-[1.5] items-center justify-between gap-2 !pr-2"
              >
                <span className="whitespace-nowrap">
                  <span className="block text-xs font-semibold">Who</span>
                  <span className={draftGuests ? "" : "text-muted"}>
                    {draftGuests ? plural(draftGuests, "guest") : "Add guests"}
                  </span>
                </span>
                <span
                  role="button"
                  tabIndex={0}
                  onClick={(e) => {
                    e.stopPropagation();
                    submit();
                  }}
                  className="flex h-12 items-center gap-2 rounded-full bg-brand px-4 font-semibold text-white hover:bg-brand-dark"
                >
                  <Search size={16} strokeWidth={3} />
                  Search
                </span>
              </Segment>
            </div>

            {/* Popover for the active section */}
            <div
              className={`mt-3 rounded-3xl bg-white p-6 shadow-card ${
                section === "where" ? "w-[420px] max-w-full" : section === "guests" ? "ml-auto w-[400px] max-w-full" : ""
              }`}
            >
              {section === "where" && (
                <div>
                  <p className="mb-2 text-xs font-semibold">Suggested destinations</p>
                  {POPULAR_DESTINATIONS.map((place) => (
                    <button
                      key={place.name}
                      type="button"
                      onClick={() => {
                        setLocation(place.name);
                        setSection("dates");
                      }}
                      className="flex w-full items-center gap-4 rounded-xl p-2 text-left hover:bg-surface"
                    >
                      <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-surface">
                        <MapPin size={20} />
                      </span>
                      <span>
                        <span className="block text-sm">{place.name}</span>
                        <span className="block text-xs text-muted">{place.hint}</span>
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {section === "dates" && (
                <DateRangeCalendar
                  value={range}
                  onChange={(next) => {
                    setRange(next);
                    if (next.from && next.to) setSection("guests");
                  }}
                />
              )}

              {section === "guests" && (
                <div className="divide-y divide-line">
                  <Counter label="Adults" description="Ages 13 or above" value={adults} onChange={setAdults} />
                  <Counter
                    label="Children"
                    description="Ages 2–12"
                    value={children}
                    onChange={(n) => {
                      setChildren(n);
                      if (n > 0 && adults === 0) setAdults(1); // children need an adult
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function Segment({
  active,
  onClick,
  className = "",
  children,
}: {
  active: boolean;
  onClick: () => void;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      onClick={onClick}
      className={`cursor-pointer rounded-full px-6 py-3 ${
        active ? "bg-white shadow-card" : "hover:bg-line/60"
      } ${className}`}
    >
      {children}
    </div>
  );
}

function toShortDate(date: Date): string {
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}
