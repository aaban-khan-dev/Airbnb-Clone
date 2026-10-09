"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import { useCallback, useRef, useState } from "react";

import { PriceBreakdown } from "@/components/booking/PriceBreakdown";
import { Counter } from "@/components/ui/Counter";
import { type DateRange, DateRangeCalendar } from "@/components/ui/DateRangeCalendar";
import { useClickOutside } from "@/hooks/useClickOutside";
import type { PriceQuote } from "@/lib/types";
import { formatPrice, plural } from "@/lib/format";

/** The sticky card on the right: dates, guests, price breakdown and Reserve. */
export function BookingCard({
  pricePerNight,
  maxGuests,
  range,
  onRangeChange,
  guests,
  onGuestsChange,
  isNightBlocked,
  quote,
  quoteError,
  quoteLoading,
  onReserve,
  isOwnListing = false,
}: {
  pricePerNight: number;
  maxGuests: number;
  range: DateRange;
  onRangeChange: (range: DateRange) => void;
  guests: number;
  onGuestsChange: (guests: number) => void;
  isNightBlocked: (day: Date) => boolean;
  quote: PriceQuote | null;
  quoteError: string | null;
  quoteLoading: boolean;
  onReserve: () => void;
  isOwnListing?: boolean;
}) {
  const [panel, setPanel] = useState<"dates" | "guests" | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const closePanel = useCallback(() => setPanel(null), []);
  useClickOutside(cardRef, closePanel, panel !== null);

  const hasDates = range.from !== null && range.to !== null;
  const unavailable = quote !== null && !quote.available;

  function handleMainButton() {
    if (!hasDates) setPanel("dates"); // "Check availability" opens the calendar
    else onReserve();
  }

  return (
    <div ref={cardRef} className="relative rounded-xl border border-line p-6 shadow-card">
      <p>
        <span className="text-[22px] font-semibold">{formatPrice(pricePerNight)}</span> night
      </p>

      <div className="mt-6 rounded-lg border border-[#b0b0b0]">
        <div className="grid grid-cols-2 border-b border-[#b0b0b0]">
          <DateBox label="Check-in" value={range.from} onClick={() => setPanel("dates")} />
          <DateBox label="Checkout" value={range.to} onClick={() => setPanel("dates")} border />
        </div>
        <button
          type="button"
          onClick={() => setPanel(panel === "guests" ? null : "guests")}
          className="flex w-full items-center justify-between px-3 py-2.5 text-left"
        >
          <span>
            <span className="block text-[10px] font-bold uppercase">Guests</span>
            <span className="text-sm">{plural(guests, "guest")}</span>
          </span>
          {panel === "guests" ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
      </div>

      {panel === "guests" && (
        <div className="absolute inset-x-6 z-30 mt-1 rounded-lg bg-white p-4 shadow-card ring-1 ring-black/5">
          <Counter label="Guests" value={guests} min={1} max={maxGuests} onChange={onGuestsChange} />
          <p className="text-xs text-muted">This place has a maximum of {plural(maxGuests, "guest")}.</p>
        </div>
      )}

      {panel === "dates" && (
        <div className="absolute right-0 top-0 z-30 w-[min(680px,90vw)] rounded-2xl bg-white p-6 shadow-card ring-1 ring-black/5">
          <p className="mb-4 text-[22px] font-semibold">
            {quote ? plural(quote.nights, "night") : "Select dates"}
          </p>
          <DateRangeCalendar
            value={range}
            onChange={(next) => {
              onRangeChange(next);
              if (next.from && next.to) setPanel(null);
            }}
            isNightBlocked={isNightBlocked}
          />
          <div className="mt-4 text-right">
            <button
              type="button"
              onClick={closePanel}
              className="rounded-lg bg-ink px-4 py-2 text-sm font-semibold text-white"
            >
              Close
            </button>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={handleMainButton}
        disabled={isOwnListing || (hasDates && (quoteLoading || unavailable || quoteError !== null))}
        className="mt-4 w-full rounded-lg bg-gradient-to-r from-[#e61e4d] to-[#d70466] py-3.5 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
      >
        {hasDates ? "Reserve" : "Check availability"}
      </button>

      {isOwnListing && (
        <p className="mt-3 text-center text-sm text-muted">You host this place, so you can&apos;t book it.</p>
      )}

      {unavailable && (
        <p className="mt-3 text-center text-sm font-semibold text-brand">Those dates are not available.</p>
      )}
      {quoteError && <p className="mt-3 text-center text-sm font-semibold text-brand">{quoteError}</p>}

      {quote && quote.available && (
        <>
          <p className="mt-3 text-center text-sm text-muted">You won&apos;t be charged yet</p>
          <div className="mt-6">
            <PriceBreakdown
              nightlyPrice={quote.nightly_price}
              nights={quote.nights}
              cleaningFee={quote.cleaning_fee}
              serviceFee={quote.service_fee}
              totalPrice={quote.total_price}
            />
          </div>
        </>
      )}
    </div>
  );
}

function DateBox({
  label,
  value,
  onClick,
  border = false,
}: {
  label: string;
  value: Date | null;
  onClick: () => void;
  border?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-2.5 text-left ${border ? "border-l border-[#b0b0b0]" : ""}`}
    >
      <span className="block text-[10px] font-bold uppercase">{label}</span>
      <span className={`text-sm ${value ? "" : "text-muted"}`}>
        {value ? value.toLocaleDateString("en-IN") : "Add date"}
      </span>
    </button>
  );
}
