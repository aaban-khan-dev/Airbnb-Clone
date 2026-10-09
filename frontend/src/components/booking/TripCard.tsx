import Link from "next/link";

import { ListingPhoto } from "@/components/listings/ListingPhoto";
import { formatDateRange, formatPrice, plural } from "@/lib/format";
import type { Booking } from "@/lib/types";

export function TripCard({ booking }: { booking: Booking }) {
  return (
    <Link
      href={`/trips/${booking.id}`}
      className="flex overflow-hidden rounded-xl border border-line transition-shadow hover:shadow-card"
    >
      <ListingPhoto
        src={booking.listing.image_url ?? ""}
        alt={booking.listing.title}
        className="h-auto w-32 shrink-0 sm:w-44"
      />
      <div className="flex-1 p-4">
        <p className="font-semibold">{booking.listing.city}</p>
        <p className="truncate text-sm text-muted">{booking.listing.title}</p>
        <p className="mt-2 text-sm">
          {formatDateRange(booking.check_in, booking.check_out)} · {plural(booking.num_guests, "guest")}
        </p>
        <p className="mt-1 text-sm">
          Hosted by {booking.listing.host_name} ·{" "}
          <span className="font-semibold">{formatPrice(booking.total_price)}</span>
        </p>
        {booking.status === "cancelled" && (
          <span className="mt-2 inline-block rounded-full bg-surface px-2 py-0.5 text-xs font-semibold text-muted">
            Cancelled
          </span>
        )}
      </div>
    </Link>
  );
}
