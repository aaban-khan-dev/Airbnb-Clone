"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { TripCard } from "@/components/booking/TripCard";
import { Container } from "@/components/ui/Container";
import { useCurrentUser } from "@/context/UserContext";
import { api } from "@/lib/api";
import { type TripTab, tripTab } from "@/lib/trips";
import type { Booking } from "@/lib/types";

const TABS: { id: TripTab; label: string }[] = [
  { id: "upcoming", label: "Upcoming" },
  { id: "past", label: "Past" },
  { id: "cancelled", label: "Cancelled" },
];

export default function TripsPage() {
  const { currentUser } = useCurrentUser();
  return (
    <Container className="py-10">
      <h1 className="mb-8 text-[32px] font-semibold">Trips</h1>
      {/* key: switching user throws away the old user's trips and loads the new ones */}
      {currentUser && <TripsList key={currentUser.id} />}
    </Container>
  );
}

function TripsList() {
  const [bookings, setBookings] = useState<Booking[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<TripTab>("upcoming");

  useEffect(() => {
    api
      .get<Booking[]>("/api/bookings/me")
      .then(setBookings)
      .catch((err: Error) => setError(err.message));
  }, []);

  if (error) return <p className="text-muted">Couldn&apos;t load your trips: {error}</p>;
  if (!bookings) return <div className="h-40 animate-pulse rounded-xl bg-surface" />;

  const visible = bookings.filter((b) => tripTab(b) === tab);
  // Upcoming: soonest first. Past and cancelled: most recent first (the API's order).
  if (tab === "upcoming") visible.reverse();

  return (
    <>
      <div className="mb-8 flex gap-6 border-b border-line">
        {TABS.map((t) => {
          const count = bookings.filter((b) => tripTab(b) === t.id).length;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`-mb-px border-b-2 pb-3 text-sm font-semibold ${
                tab === t.id ? "border-ink" : "border-transparent text-muted hover:text-ink"
              }`}
            >
              {t.label} ({count})
            </button>
          );
        })}
      </div>

      {visible.length === 0 ? (
        <div className="border-b border-line pb-12">
          <h2 className="text-[22px] font-semibold">
            {tab === "upcoming" ? "No trips booked...yet!" : `No ${tab} trips`}
          </h2>
          <p className="mt-2 text-muted">Time to dust off your bags and start planning your next adventure.</p>
          <Link
            href="/"
            className="mt-6 inline-block rounded-lg border border-ink px-6 py-3 font-semibold hover:bg-surface"
          >
            Start searching
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {visible.map((booking) => (
            <TripCard key={booking.id} booking={booking} />
          ))}
        </div>
      )}
    </>
  );
}
