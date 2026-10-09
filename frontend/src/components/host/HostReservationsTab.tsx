"use client";

import { useEffect, useState } from "react";

import { Avatar } from "@/components/ui/Avatar";
import { api } from "@/lib/api";
import { formatDateRange, formatPrice, plural } from "@/lib/format";
import type { Booking } from "@/lib/types";

type When = "upcoming" | "past" | "cancelled";

const FILTERS: { id: When; label: string }[] = [
  { id: "upcoming", label: "Upcoming" },
  { id: "past", label: "Completed" },
  { id: "cancelled", label: "Cancelled" },
];

export function HostReservationsTab() {
  const [when, setWhen] = useState<When>("upcoming");
  return (
    <div>
      <div className="mb-6 flex gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setWhen(f.id)}
            className={`rounded-full border px-4 py-2 text-sm font-semibold ${
              when === f.id ? "border-ink bg-ink text-white" : "border-line hover:border-ink"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>
      {/* key: a fresh list (and fetch) for each filter */}
      <ReservationList key={when} when={when} />
    </div>
  );
}

function ReservationList({ when }: { when: When }) {
  const [bookings, setBookings] = useState<Booking[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<Booking[]>(`/api/host/bookings?when=${when}`)
      .then(setBookings)
      .catch((err: Error) => setError(err.message));
  }, [when]);

  if (error) return <p className="text-muted">Couldn&apos;t load reservations: {error}</p>;
  if (!bookings) return <div className="h-40 animate-pulse rounded-xl bg-surface" />;
  if (bookings.length === 0) {
    return <p className="rounded-xl border border-dashed border-line p-10 text-center text-muted">No reservations here.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-line">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead className="bg-surface text-xs uppercase text-muted">
          <tr>
            <th className="px-4 py-3 font-semibold">Guest</th>
            <th className="px-4 py-3 font-semibold">Listing</th>
            <th className="px-4 py-3 font-semibold">Dates</th>
            <th className="px-4 py-3 font-semibold">Guests</th>
            <th className="px-4 py-3 text-right font-semibold">Payout</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {bookings.map((b) => (
            <tr key={b.id}>
              <td className="px-4 py-3">
                <span className="flex items-center gap-3">
                  <Avatar name={b.guest.name} src={b.guest.avatar_url} size={32} />
                  {b.guest.name}
                </span>
              </td>
              <td className="max-w-[260px] truncate px-4 py-3">{b.listing.title}</td>
              <td className="whitespace-nowrap px-4 py-3">
                {formatDateRange(b.check_in, b.check_out)} · {plural(b.nights, "night")}
              </td>
              <td className="px-4 py-3">{b.num_guests}</td>
              {/* the host receives the total minus the guest service fee */}
              <td className="px-4 py-3 text-right font-semibold">{formatPrice(b.total_price - b.service_fee)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
