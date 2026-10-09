"use client";

import { Plus } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { HostListingsTab } from "@/components/host/HostListingsTab";
import { HostReservationsTab } from "@/components/host/HostReservationsTab";
import { Container } from "@/components/ui/Container";
import { useCurrentUser } from "@/context/UserContext";
import { api } from "@/lib/api";
import { formatPrice } from "@/lib/format";
import type { HostListingSummary } from "@/lib/types";

export default function HostDashboardPage() {
  const { currentUser } = useCurrentUser();
  if (!currentUser) return null;
  // key: switching user shows that user's dashboard
  return <HostDashboard key={currentUser.id} firstName={currentUser.name.split(" ")[0]} />;
}

function HostDashboard({ firstName }: { firstName: string }) {
  const [listings, setListings] = useState<HostListingSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<"listings" | "reservations">("listings");

  const load = useCallback(() => {
    api
      .get<HostListingSummary[]>("/api/host/listings")
      .then(setListings)
      .catch((err: Error) => setError(err.message));
  }, []);

  useEffect(load, [load]);

  const upcoming = listings?.reduce((sum, l) => sum + l.upcoming_bookings, 0) ?? 0;
  const earnings = listings?.reduce((sum, l) => sum + l.total_earnings, 0) ?? 0;

  return (
    <Container className="py-10">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[32px] font-semibold">Welcome, {firstName}!</h1>
          <p className="text-muted">Manage your listings and reservations.</p>
        </div>
        <Link
          href="/host/listings/new"
          className="flex items-center gap-2 rounded-lg border border-ink px-5 py-3 font-semibold hover:bg-surface"
        >
          <Plus size={16} /> Create listing
        </Link>
      </div>

      {listings && listings.length > 0 && (
        <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard label="Active listings" value={String(listings.length)} />
          <StatCard label="Upcoming reservations" value={String(upcoming)} />
          <StatCard label="Total earnings" value={formatPrice(earnings)} />
        </div>
      )}

      <div className="mb-6 flex gap-6 border-b border-line">
        {(["listings", "reservations"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`-mb-px border-b-2 pb-3 font-semibold ${
              tab === t ? "border-ink" : "border-transparent text-muted hover:text-ink"
            }`}
          >
            {t === "listings" ? "Your listings" : "Reservations"}
          </button>
        ))}
      </div>

      {error && <p className="text-muted">Couldn&apos;t load your listings: {error}</p>}
      {!error && !listings && <div className="h-40 animate-pulse rounded-xl bg-surface" />}
      {listings && tab === "listings" && <HostListingsTab listings={listings} onChanged={load} />}
      {listings && tab === "reservations" && <HostReservationsTab />}
    </Container>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-line p-5">
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
    </div>
  );
}
