"use client";

import { ChevronLeft, Star } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { toast } from "sonner";

import { EMPTY_CARD, PaymentForm, validateCard } from "@/components/booking/PaymentForm";
import { PriceBreakdown } from "@/components/booking/PriceBreakdown";
import { ListingPhoto } from "@/components/listings/ListingPhoto";
import { Container } from "@/components/ui/Container";
import { useCurrentUser } from "@/context/UserContext";
import { usePriceQuote } from "@/hooks/usePriceQuote";
import { ApiError, api } from "@/lib/api";
import { formatDateRange, plural } from "@/lib/format";
import type { Booking, ListingDetail } from "@/lib/types";

export default function CheckoutPage() {
  return (
    <Suspense>
      <Checkout />
    </Suspense>
  );
}

function Checkout() {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { currentUser } = useCurrentUser();

  const checkIn = searchParams.get("check_in");
  const checkOut = searchParams.get("check_out");
  const guests = Number(searchParams.get("guests")) || 1;

  const [listing, setListing] = useState<ListingDetail | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [card, setCard] = useState(EMPTY_CARD);
  const [cardError, setCardError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api
      .get<ListingDetail>(`/api/listings/${id}`)
      .then(setListing)
      .catch((err: Error) => setLoadError(err.message));
  }, [id]);

  const { quote, error: quoteError } = usePriceQuote(Number(id), checkIn, checkOut, guests);
  const backToListing = `/listings/${id}${checkIn && checkOut ? `?check_in=${checkIn}&check_out=${checkOut}` : ""}`;

  async function confirmAndPay() {
    const problem = validateCard(card);
    setCardError(problem);
    if (problem || !checkIn || !checkOut) return;

    setSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1200)); // pretend to talk to a payment provider
      const booking = await api.post<Booking>("/api/bookings", {
        listing_id: Number(id),
        check_in: checkIn,
        check_out: checkOut,
        num_guests: guests,
      });
      toast.success("Reservation confirmed!");
      router.replace(`/trips/${booking.id}?confirmed=1`);
    } catch (err) {
      // e.g. 409: someone else booked these dates a moment ago
      toast.error(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
      setSubmitting(false);
    }
  }

  if (!checkIn || !checkOut) {
    return (
      <Container className="py-24">
        <h1 className="text-2xl font-semibold">Choose your dates first</h1>
        <Link href={`/listings/${id}`} className="mt-4 inline-block font-semibold underline">
          Back to the listing
        </Link>
      </Container>
    );
  }
  if (loadError) {
    return (
      <Container className="py-24">
        <h1 className="text-2xl font-semibold">This listing isn&apos;t available</h1>
        <Link href="/" className="mt-4 inline-block font-semibold underline">
          Back to all stays
        </Link>
      </Container>
    );
  }

  const isOwnListing = listing !== null && currentUser?.id === listing.host.id;
  const unavailable = quote !== null && !quote.available;
  const blockingMessage = isOwnListing
    ? "You host this place, so you can't book it. Switch to a guest account from the menu."
    : unavailable
      ? "These dates are no longer available."
      : quoteError;

  return (
    <Container className="max-w-[1120px] py-10">
      <div className="mb-10 flex items-center gap-4">
        <Link href={backToListing} aria-label="Back" className="rounded-full p-2 hover:bg-surface">
          <ChevronLeft size={20} />
        </Link>
        <h1 className="text-[32px] font-semibold">Confirm and pay</h1>
      </div>

      <div className="grid grid-cols-1 gap-16 md:grid-cols-[1fr_minmax(340px,440px)]">
        {/* Left: trip + payment */}
        <div className="divide-y divide-line">
          <section className="pb-8">
            <h2 className="mb-6 text-[22px] font-semibold">Your trip</h2>
            <TripRow label="Dates" value={formatDateRange(checkIn, checkOut)} editHref={backToListing} />
            <TripRow label="Guests" value={plural(guests, "guest")} editHref={backToListing} />
          </section>

          <section className="py-8">
            <h2 className="mb-6 text-[22px] font-semibold">Pay with</h2>
            <PaymentForm
              card={card}
              onChange={(next) => {
                setCard(next);
                setCardError(null); // hide the old error while the user fixes it
              }}
            />
            {cardError && <p className="mt-3 text-sm font-semibold text-brand">{cardError}</p>}
          </section>

          <section className="py-8">
            <h2 className="mb-2 text-[22px] font-semibold">Cancellation policy</h2>
            <p className="text-muted">
              Free cancellation any time before check-in. After that, the reservation is non-refundable.
            </p>
          </section>

          <section className="pt-8">
            {blockingMessage && (
              <div className="mb-6 rounded-lg border border-brand/40 bg-brand/5 p-4 text-sm">
                {blockingMessage}{" "}
                <Link href={backToListing} className="font-semibold underline">
                  Change dates
                </Link>
              </div>
            )}
            <p className="mb-6 text-xs text-muted">
              By selecting the button below, I agree to the house rules and the cancellation policy.
            </p>
            <button
              type="button"
              onClick={confirmAndPay}
              disabled={submitting || !quote || Boolean(blockingMessage)}
              className="w-full rounded-lg bg-gradient-to-r from-[#e61e4d] to-[#d70466] py-4 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40 md:w-auto md:px-10"
            >
              {submitting ? "Processing payment…" : "Confirm and pay"}
            </button>
          </section>
        </div>

        {/* Right: summary */}
        <aside className="md:sticky md:top-28 md:self-start">
          <div className="rounded-xl border border-line p-6">
            {listing ? (
              <div className="flex gap-4 border-b border-line pb-6">
                <ListingPhoto
                  src={listing.image_urls[0] ?? ""}
                  alt={listing.title}
                  className="h-24 w-28 shrink-0 rounded-lg"
                />
                <div className="text-sm">
                  <p className="font-semibold">{listing.title}</p>
                  <p className="text-muted">{listing.property_type}</p>
                  <p className="mt-1 flex items-center gap-1">
                    <Star size={12} className="fill-ink" />
                    {listing.rating !== null ? listing.rating.toFixed(2) : "New"}
                    <span className="text-muted">({plural(listing.review_count, "review")})</span>
                  </p>
                </div>
              </div>
            ) : (
              <div className="h-24 animate-pulse rounded-lg bg-surface" />
            )}

            <h2 className="mb-6 mt-6 text-[22px] font-semibold">Price details</h2>
            {quote ? (
              <PriceBreakdown
                nightlyPrice={quote.nightly_price}
                nights={quote.nights}
                cleaningFee={quote.cleaning_fee}
                serviceFee={quote.service_fee}
                totalPrice={quote.total_price}
                totalLabel="Total (INR)"
              />
            ) : (
              <div className="h-32 animate-pulse rounded-lg bg-surface" />
            )}
          </div>
        </aside>
      </div>
    </Container>
  );
}

function TripRow({ label, value, editHref }: { label: string; value: string; editHref: string }) {
  return (
    <div className="mb-4 flex items-start justify-between">
      <div>
        <p className="font-semibold">{label}</p>
        <p>{value}</p>
      </div>
      <Link href={editHref} className="font-semibold underline">
        Edit
      </Link>
    </div>
  );
}
