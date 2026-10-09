"use client";

import { Medal, Share, Star } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { AboutSection } from "@/components/listing-detail/AboutSection";
import { AmenitiesSection } from "@/components/listing-detail/AmenitiesSection";
import { BookingCard } from "@/components/listing-detail/BookingCard";
import { HeartButton } from "@/components/listings/HeartButton";
import { HostSection } from "@/components/listing-detail/HostSection";
import { LocationMap } from "@/components/listing-detail/LocationMap";
import { MobileReserveBar } from "@/components/listing-detail/MobileReserveBar";
import { PhotoGrid } from "@/components/listing-detail/PhotoGrid";
import { ReviewsSection } from "@/components/listing-detail/ReviewsSection";
import { SleepSection } from "@/components/listing-detail/SleepSection";
import { ThingsToKnow } from "@/components/listing-detail/ThingsToKnow";
import { Avatar } from "@/components/ui/Avatar";
import { useCurrentUser } from "@/context/UserContext";
import { Container } from "@/components/ui/Container";
import { type DateRange, DateRangeCalendar } from "@/components/ui/DateRangeCalendar";
import { usePriceQuote } from "@/hooks/usePriceQuote";
import { ApiError, api } from "@/lib/api";
import { buildBlockedNights } from "@/lib/availability";
import { APP_NAME } from "@/lib/config";
import { formatDateRange, fromISODate, plural, toISODate } from "@/lib/format";
import type { ListingDetail } from "@/lib/types";

export default function ListingPage() {
  return (
    <Suspense>
      <ListingPageContent />
    </Suspense>
  );
}

type LoadState =
  | { status: "loading" }
  | { status: "not-found" }
  | { status: "error"; message: string }
  | { status: "ready"; listing: ListingDetail };

function ListingPageContent() {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { currentUser } = useCurrentUser();
  const [state, setState] = useState<LoadState>({ status: "loading" });

  // Dates and guests can arrive pre-filled from the search (?check_in=...&check_out=...)
  const [range, setRange] = useState<DateRange>(() => {
    const checkIn = searchParams.get("check_in");
    const checkOut = searchParams.get("check_out");
    return checkIn && checkOut
      ? { from: fromISODate(checkIn), to: fromISODate(checkOut) }
      : { from: null, to: null };
  });
  const [guests, setGuests] = useState(() => Number(searchParams.get("guests")) || 1);

  useEffect(() => {
    api
      .get<ListingDetail>(`/api/listings/${id}`)
      .then((listing) => setState({ status: "ready", listing }))
      .catch((err) =>
        setState(
          err instanceof ApiError && (err.status === 404 || err.status === 422)
            ? { status: "not-found" }
            : { status: "error", message: err.message },
        ),
      );
  }, [id]);

  const listing = state.status === "ready" ? state.listing : null;

  // Booked nights as a Set, so checking a day is instant
  const blockedNights = useMemo(
    () => buildBlockedNights(listing?.unavailable_ranges ?? []),
    [listing],
  );
  const isNightBlocked = useCallback((day: Date) => blockedNights.has(toISODate(day)), [blockedNights]);

  const checkIn = range.from ? toISODate(range.from) : null;
  const checkOut = range.to ? toISODate(range.to) : null;
  const { quote, error: quoteError, loading: quoteLoading } = usePriceQuote(
    Number(id),
    checkIn,
    checkOut,
    Math.min(guests, listing?.max_guests ?? guests),
  );

  function reserve() {
    if (!checkIn || !checkOut) return;
    router.push(`/book/${id}?check_in=${checkIn}&check_out=${checkOut}&guests=${guests}`);
  }

  if (state.status === "loading") return <DetailSkeleton />;
  if (state.status === "not-found") {
    return (
      <Container className="py-24">
        <h1 className="text-3xl font-semibold">This listing isn&apos;t available</h1>
        <p className="mt-2 text-muted">It may have been removed by the host.</p>
        <Link href="/" className="mt-6 inline-block font-semibold underline">
          Back to all stays
        </Link>
      </Container>
    );
  }
  if (state.status === "error") {
    return (
      <Container className="py-24">
        <h1 className="text-2xl font-semibold">Something went wrong</h1>
        <p className="mt-2 text-muted">{state.message}</p>
      </Container>
    );
  }

  const l = state.listing;
  const location = `${l.city}, ${l.state}, ${l.country}`;

  // Shared by the desktop booking card and the mobile reserve bar
  const booking = {
    pricePerNight: l.price_per_night,
    maxGuests: l.max_guests,
    range,
    onRangeChange: setRange,
    guests: Math.min(guests, l.max_guests),
    onGuestsChange: setGuests,
    isNightBlocked,
    quote,
    quoteError,
    quoteLoading,
    onReserve: reserve,
    isOwnListing: currentUser?.id === l.host.id,
  };
  const isGuestFavourite = l.rating !== null && l.rating >= 4.8 && l.review_count >= 3;

  return (
    <Container className="max-w-[1280px] pb-24 md:pb-0 md:pt-6">
      {/* Phones: photos first, then the title (Airbnb's mobile order). Desktop: title first. */}
      <div className="flex flex-col">
        {/* Title row */}
        <div className="order-2 mt-6 flex flex-col gap-2 md:order-1 md:mb-6 md:mt-0 md:flex-row md:items-end md:justify-between md:gap-4">
          <h1 className="text-[22px] font-semibold md:text-[26px]">{l.title}</h1>
          <div className="-ml-3 flex shrink-0 gap-2 text-sm font-semibold md:ml-0">
            <button
              type="button"
              onClick={() => {
                void navigator.clipboard?.writeText(window.location.href);
                toast.success("Link copied");
              }}
              className="flex items-center gap-2 rounded-lg px-3 py-2 underline hover:bg-surface"
            >
              <Share size={16} /> Share
            </button>
            <HeartButton listingId={l.id} variant="text" />
          </div>
        </div>

        <div className="order-1 md:order-2">
          <PhotoGrid images={l.image_urls} title={l.title} />
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-16 md:mt-10 md:grid-cols-[1fr_minmax(320px,370px)]">
        {/* Left column */}
        <div className="divide-y divide-line">
          <section className="pb-8">
            <h2 className="text-[22px] font-semibold">
              {l.property_type} in {l.city}, {l.state}
            </h2>
            <p className="mt-1">
              {plural(l.max_guests, "guest")} · {plural(l.bedrooms, "bedroom")} · {plural(l.beds, "bed")} ·{" "}
              {plural(l.bathrooms, "bath")}
            </p>
            <a href="#reviews" className="mt-2 flex items-center gap-1 font-semibold">
              <Star size={14} className="fill-ink" />
              {l.rating !== null ? l.rating.toFixed(2) : "New"}
              {l.review_count > 0 && <span className="underline">· {plural(l.review_count, "review")}</span>}
            </a>
            {isGuestFavourite && (
              <div className="mt-6 rounded-xl border border-line p-5 font-semibold">
                Guest favourite: one of the most loved homes on {APP_NAME}, according to guests
              </div>
            )}
          </section>

          <section className="flex items-center gap-4 py-6">
            <Avatar name={l.host.name} src={l.host.avatar_url} size={40} />
            <div>
              <p className="font-semibold">Hosted by {l.host.name}</p>
              {l.host.is_superhost && (
                <p className="flex items-center gap-1 text-sm text-muted">
                  <Medal size={14} /> Superhost
                </p>
              )}
            </div>
          </section>

          <AboutSection
            summary={l.description}
            space={l.space}
            guestAccess={l.guest_access}
            otherNotes={l.other_notes}
          />

          <SleepSection bedrooms={l.bedroom_details} />

          <AmenitiesSection amenities={l.amenities} />

          <section className="py-10">
            <h2 className="text-[22px] font-semibold">
              {quote ? `${plural(quote.nights, "night")} in ${l.city}` : "Select check-in date"}
            </h2>
            <p className="mb-6 mt-1 text-sm text-muted">
              {checkIn && checkOut ? formatDateRange(checkIn, checkOut) : "Add your travel dates for exact pricing"}
            </p>
            <DateRangeCalendar value={range} onChange={setRange} isNightBlocked={isNightBlocked} />
          </section>
        </div>

        {/* Right column: sticky booking card (on phones it becomes the bottom bar below) */}
        <aside className="hidden md:sticky md:top-28 md:block md:self-start">
          <BookingCard {...booking} />
        </aside>
      </div>
      <MobileReserveBar {...booking} />

      <div className="divide-y divide-line border-t border-line">
        <ReviewsSection reviews={l.reviews} rating={l.rating} />
        <LocationMap latitude={l.latitude} longitude={l.longitude} label={location} />
        <HostSection host={l.host} reviewCount={l.review_count} />
        <ThingsToKnow listing={l} checkIn={checkIn} />
      </div>
    </Container>
  );
}

function DetailSkeleton() {
  return (
    <Container className="max-w-[1280px] animate-pulse pt-6">
      <div className="mb-6 h-8 w-1/2 rounded bg-surface" />
      <div className="h-[440px] rounded-xl bg-surface" />
      <div className="mt-10 h-6 w-1/3 rounded bg-surface" />
      <div className="mt-3 h-4 w-1/4 rounded bg-surface" />
    </Container>
  );
}
