"use client";

import { Heart, Star } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

import { ImageCarousel } from "@/components/listings/ImageCarousel";
import { countNights, formatPrice, plural } from "@/lib/format";
import type { ListingCard as ListingCardData } from "@/lib/types";

export function ListingCard({
  listing,
  checkIn,
  checkOut,
}: {
  listing: ListingCardData;
  checkIn?: string;
  checkOut?: string;
}) {
  // Airbnb's "Guest favourite" badge: highly rated with enough reviews
  const isGuestFavourite = listing.rating !== null && listing.rating >= 4.8 && listing.review_count >= 3;
  const nights = checkIn && checkOut ? countNights(checkIn, checkOut) : 0;

  // Keep the searched dates when opening the listing, so its calendar is pre-filled
  const href = nights > 0 ? `/listings/${listing.id}?check_in=${checkIn}&check_out=${checkOut}` : `/listings/${listing.id}`;

  return (
    <Link href={href} className="group block">
      <div className="relative aspect-square overflow-hidden rounded-xl bg-surface">
        <ImageCarousel images={listing.image_urls} alt={listing.title} />

        {isGuestFavourite && (
          <span className="absolute left-3 top-3 rounded-full bg-white px-3 py-1 text-xs font-semibold shadow">
            Guest favourite
          </span>
        )}

        <button
          type="button"
          aria-label="Save to wishlist"
          onClick={(e) => {
            e.preventDefault(); // don't open the listing
            toast("Saving to wishlists is coming soon");
          }}
          className="absolute right-3 top-3 transition-transform hover:scale-110"
        >
          <Heart size={24} className="fill-black/50 text-white" strokeWidth={2} />
        </button>
      </div>

      <div className="mt-3 text-[15px]">
        <div className="flex items-start justify-between gap-2">
          <h3 className="truncate font-semibold">
            {listing.city}, {listing.state}
          </h3>
          <span className="flex shrink-0 items-center gap-1">
            <Star size={12} className="fill-ink" />
            {listing.rating !== null ? listing.rating.toFixed(2) : "New"}
          </span>
        </div>
        <p className="truncate text-muted">{listing.title}</p>
        <p className="text-muted">
          {listing.property_type} · {plural(listing.bedrooms, "bedroom")}
        </p>
        <p className="mt-1">
          {nights > 0 ? (
            <>
              <span className="font-semibold underline">{formatPrice(listing.price_per_night * nights)}</span>{" "}
              for {plural(nights, "night")}
            </>
          ) : (
            <>
              <span className="font-semibold">{formatPrice(listing.price_per_night)}</span> night
            </>
          )}
        </p>
      </div>
    </Link>
  );
}

export function ListingCardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="aspect-square rounded-xl bg-surface" />
      <div className="mt-3 h-4 w-2/3 rounded bg-surface" />
      <div className="mt-2 h-4 w-1/2 rounded bg-surface" />
      <div className="mt-2 h-4 w-1/3 rounded bg-surface" />
    </div>
  );
}
