"use client";

import { useState } from "react";

import { Counter } from "@/components/ui/Counter";
import { type DateRange, DateRangeCalendar } from "@/components/ui/DateRangeCalendar";
import { Modal } from "@/components/ui/Modal";
import { formatPrice, plural } from "@/lib/format";
import type { PriceQuote } from "@/lib/types";

/** Phones: the booking card becomes a bar stuck to the bottom of the screen,
 *  and dates/guests are picked in a bottom sheet. */
export function MobileReserveBar({
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
  isOwnListing,
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
  isOwnListing: boolean;
}) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const hasDates = range.from !== null && range.to !== null;
  const unavailable = quote !== null && !quote.available;
  const problem = isOwnListing ? "You host this place" : unavailable ? "Dates not available" : quoteError;

  return (
    <>
      <div className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-between gap-4 border-t border-line bg-canvas px-6 py-3 md:hidden">
        <button type="button" onClick={() => setSheetOpen(true)} className="min-w-0 text-left">
          {quote && quote.available ? (
            <span className="block font-semibold">
              {formatPrice(quote.total_price)} <span className="font-normal">total</span>
            </span>
          ) : (
            <span className="block font-semibold">
              {formatPrice(pricePerNight)} <span className="font-normal">night</span>
            </span>
          )}
          <span className={`block truncate text-sm underline ${problem ? "text-brand" : ""}`}>
            {problem ??
              (hasDates && quote ? `${plural(quote.nights, "night")} · ${plural(guests, "guest")}` : "Add dates")}
          </span>
        </button>
        <button
          type="button"
          disabled={isOwnListing || (hasDates && (quoteLoading || unavailable || quoteError !== null))}
          onClick={() => (hasDates ? onReserve() : setSheetOpen(true))}
          className="shrink-0 rounded-lg bg-brand-gradient px-6 py-3 font-semibold text-white disabled:opacity-40"
        >
          {hasDates ? "Reserve" : "Check availability"}
        </button>
      </div>

      <Modal
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title="Your trip"
        footer={
          <div className="flex items-center justify-between">
            <button type="button" onClick={() => onRangeChange({ from: null, to: null })} className="font-semibold underline">
              Clear dates
            </button>
            <button
              type="button"
              onClick={() => setSheetOpen(false)}
              className="rounded-lg bg-ink px-6 py-3 font-semibold text-canvas"
            >
              Save
            </button>
          </div>
        }
      >
        <DateRangeCalendar value={range} onChange={onRangeChange} isNightBlocked={isNightBlocked} />
        <div className="mt-6 border-t border-line pt-2">
          <Counter
            label="Guests"
            description={`Up to ${plural(maxGuests, "guest")}`}
            value={guests}
            min={1}
            max={maxGuests}
            onChange={onGuestsChange}
          />
        </div>
      </Modal>
    </>
  );
}
