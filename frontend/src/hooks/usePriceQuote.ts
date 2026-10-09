"use client";

import { useEffect, useState } from "react";

import { api } from "@/lib/api";
import type { PriceQuote } from "@/lib/types";

type QuoteState = { key: string; quote: PriceQuote | null; error: string | null };

/**
 * Asks the backend for the price of a stay whenever the dates or guests change.
 * Prices are calculated on the server only, so the frontend can never disagree
 * with what the booking will actually cost.
 */
export function usePriceQuote(
  listingId: number,
  checkIn: string | null,
  checkOut: string | null,
  guests: number,
) {
  const key = checkIn && checkOut ? `${checkIn}|${checkOut}|${guests}` : null;
  const [state, setState] = useState<QuoteState | null>(null);

  useEffect(() => {
    if (!key) return;
    let cancelled = false;
    api
      .get<PriceQuote>(`/api/listings/${listingId}/quote?check_in=${checkIn}&check_out=${checkOut}&guests=${guests}`)
      .then((quote) => !cancelled && setState({ key, quote, error: null }))
      .catch((err: Error) => !cancelled && setState({ key, quote: null, error: err.message }));
    return () => {
      cancelled = true;
    };
  }, [key, listingId, checkIn, checkOut, guests]);

  // Only trust a result that belongs to the current dates/guests
  const current = state && state.key === key ? state : null;
  return {
    quote: current?.quote ?? null,
    error: current?.error ?? null,
    loading: key !== null && current === null,
  };
}
