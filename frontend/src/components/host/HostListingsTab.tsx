"use client";

import { House, Pencil, Star, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

import { ListingPhoto } from "@/components/listings/ListingPhoto";
import { Modal } from "@/components/ui/Modal";
import { useCurrentUser } from "@/context/UserContext";
import { ApiError, api } from "@/lib/api";
import { formatPrice, plural } from "@/lib/format";
import type { HostListingSummary } from "@/lib/types";

export function HostListingsTab({
  listings,
  onChanged,
}: {
  listings: HostListingSummary[];
  onChanged: () => void;
}) {
  const { refreshUsers } = useCurrentUser();
  const [toDelete, setToDelete] = useState<HostListingSummary | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function confirmDelete() {
    if (!toDelete) return;
    setDeleting(true);
    try {
      const result = await api.delete<{ cancelled_bookings: number }>(`/api/host/listings/${toDelete.id}`);
      toast.success(
        result.cancelled_bookings
          ? `Listing deleted. ${plural(result.cancelled_bookings, "upcoming reservation")} cancelled.`
          : "Listing deleted",
      );
      setToDelete(null);
      onChanged();
      void refreshUsers(); // deleting your last listing makes you a guest again
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Couldn't delete the listing");
    } finally {
      setDeleting(false);
    }
  }

  if (listings.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-line p-12 text-center">
        <House size={40} strokeWidth={1.4} className="mx-auto text-muted" />
        <h2 className="mt-4 text-[22px] font-semibold">Create your first listing</h2>
        <p className="mt-1 text-muted">It only takes a few minutes to share your place with guests.</p>
        <Link
          href="/host/listings/new"
          className="mt-6 inline-block rounded-lg bg-gradient-to-r from-[#e61e4d] to-[#d70466] px-6 py-3 font-semibold text-white"
        >
          Get started
        </Link>
      </div>
    );
  }

  return (
    <>
      <ul className="divide-y divide-line rounded-xl border border-line">
        {listings.map((listing) => (
          <li key={listing.id} className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
            <Link href={`/listings/${listing.id}`} className="flex flex-1 items-center gap-4">
              <ListingPhoto
                src={listing.cover_image_url ?? ""}
                alt={listing.title}
                className="h-16 w-24 shrink-0 rounded-lg"
              />
              <div className="min-w-0">
                <p className="truncate font-semibold">{listing.title}</p>
                <p className="text-sm text-muted">
                  {listing.property_type} · {listing.city}, {listing.state}
                </p>
              </div>
            </Link>

            <dl className="grid grid-cols-4 gap-4 text-sm sm:w-[440px]">
              <Stat label="Price" value={`${formatPrice(listing.price_per_night)}`} />
              <Stat
                label="Rating"
                value={
                  listing.rating !== null ? (
                    <span className="flex items-center gap-1">
                      <Star size={12} className="fill-ink" /> {listing.rating.toFixed(2)}
                    </span>
                  ) : (
                    "New"
                  )
                }
              />
              <Stat label="Upcoming" value={listing.upcoming_bookings} />
              <Stat label="Earned" value={formatPrice(listing.total_earnings)} />
            </dl>

            <div className="flex gap-2">
              <Link
                href={`/host/listings/${listing.id}/edit`}
                className="flex items-center gap-1 rounded-lg border border-line px-3 py-2 text-sm font-semibold hover:border-ink"
              >
                <Pencil size={14} /> Edit
              </Link>
              <button
                type="button"
                onClick={() => setToDelete(listing)}
                aria-label={`Delete ${listing.title}`}
                className="rounded-lg border border-line px-3 py-2 text-sm hover:border-brand hover:text-brand"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </li>
        ))}
      </ul>

      <Modal
        open={toDelete !== null}
        onClose={() => setToDelete(null)}
        title="Delete listing"
        footer={
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setToDelete(null)} className="px-4 py-3 font-semibold underline">
              Keep it
            </button>
            <button
              type="button"
              onClick={confirmDelete}
              disabled={deleting}
              className="rounded-lg bg-brand px-6 py-3 font-semibold text-white disabled:opacity-50"
            >
              {deleting ? "Deleting…" : "Delete"}
            </button>
          </div>
        }
      >
        {toDelete && (
          <p>
            Delete <strong>{toDelete.title}</strong>? It will disappear from search.
            {toDelete.upcoming_bookings > 0 &&
              ` Its ${plural(toDelete.upcoming_bookings, "upcoming reservation")} will be cancelled.`}{" "}
            Past trips stay in your guests&apos; history.
          </p>
        )}
      </Modal>
    </>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="font-semibold">{value}</dd>
    </div>
  );
}
