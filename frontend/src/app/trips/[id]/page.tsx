"use client";

import { CircleCheck } from "lucide-react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { toast } from "sonner";

import { PriceBreakdown } from "@/components/booking/PriceBreakdown";
import { ListingPhoto } from "@/components/listings/ListingPhoto";
import { Container } from "@/components/ui/Container";
import { Modal } from "@/components/ui/Modal";
import { useCurrentUser } from "@/context/UserContext";
import { ApiError, api } from "@/lib/api";
import { formatLongDate, plural } from "@/lib/format";
import { canCancel, tripTab } from "@/lib/trips";
import type { Booking } from "@/lib/types";

export default function TripPage() {
  const { currentUser } = useCurrentUser();
  return (
    <Suspense>
      {currentUser && <TripDetails key={currentUser.id} />}
    </Suspense>
  );
}

function TripDetails() {
  const { id } = useParams<{ id: string }>();
  const justBooked = useSearchParams().get("confirmed") === "1";
  const [booking, setBooking] = useState<Booking | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    api
      .get<Booking>(`/api/bookings/${id}`)
      .then(setBooking)
      .catch((err: Error) =>
        setError(err instanceof ApiError && err.status === 404 ? "We couldn't find this trip." : err.message),
      );
  }, [id]);

  async function cancel() {
    setCancelling(true);
    try {
      setBooking(await api.post<Booking>(`/api/bookings/${id}/cancel`));
      toast.success("Your reservation was cancelled");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Couldn't cancel. Please try again.");
    } finally {
      setCancelling(false);
      setConfirmCancel(false);
    }
  }

  if (error) {
    return (
      <Container className="py-24">
        <h1 className="text-2xl font-semibold">{error}</h1>
        <Link href="/trips" className="mt-4 inline-block font-semibold underline">
          Back to trips
        </Link>
      </Container>
    );
  }
  if (!booking) return <Container className="py-10"><div className="h-80 animate-pulse rounded-xl bg-surface" /></Container>;

  const status = tripTab(booking);

  return (
    <Container className="max-w-[880px] py-10">
      {justBooked && booking.status === "confirmed" && (
        <div className="mb-8 flex items-center gap-3 rounded-xl bg-[#008a05]/10 p-5 text-[#006b04]">
          <CircleCheck size={24} />
          <div>
            <p className="font-semibold">Your reservation is confirmed</p>
            <p className="text-sm">You&apos;re going to {booking.listing.city}! The host has your booking details.</p>
          </div>
        </div>
      )}

      <Link href="/trips" className="text-sm font-semibold underline">
        ← All trips
      </Link>

      <div className="mt-6 overflow-hidden rounded-xl border border-line">
        <ListingPhoto src={booking.listing.image_url ?? ""} alt={booking.listing.title} className="h-64 w-full" />
        <div className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-[26px] font-semibold">{booking.listing.city}</h1>
              <Link href={`/listings/${booking.listing.id}`} className="text-muted underline">
                {booking.listing.title}
              </Link>
            </div>
            <span className="shrink-0 rounded-full bg-surface px-3 py-1 text-xs font-semibold uppercase">
              {booking.status === "cancelled" ? "Cancelled" : status === "past" ? "Completed" : "Confirmed"}
            </span>
          </div>

          <div className="mt-6 grid grid-cols-2 divide-x divide-line rounded-xl border border-line">
            <div className="p-4">
              <p className="text-xs font-bold uppercase">Check-in</p>
              <p>{formatLongDate(booking.check_in)}</p>
              <p className="text-sm text-muted">After 2:00 PM</p>
            </div>
            <div className="p-4">
              <p className="text-xs font-bold uppercase">Checkout</p>
              <p>{formatLongDate(booking.check_out)}</p>
              <p className="text-sm text-muted">Before 11:00 AM</p>
            </div>
          </div>

          <dl className="mt-6 grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="font-semibold">Guests</dt>
              <dd>{plural(booking.num_guests, "guest")}</dd>
            </div>
            <div>
              <dt className="font-semibold">Host</dt>
              <dd>{booking.listing.host_name}</dd>
            </div>
            <div>
              <dt className="font-semibold">Confirmation code</dt>
              <dd>#{String(booking.id).padStart(6, "0")}</dd>
            </div>
            <div>
              <dt className="font-semibold">Booked on</dt>
              <dd>{formatLongDate(booking.created_at.slice(0, 10))}</dd>
            </div>
          </dl>

          <h2 className="mb-4 mt-8 text-lg font-semibold">Payment</h2>
          <PriceBreakdown
            nightlyPrice={booking.nightly_price}
            nights={booking.nights}
            cleaningFee={booking.cleaning_fee}
            serviceFee={booking.service_fee}
            totalPrice={booking.total_price}
            totalLabel={booking.status === "cancelled" ? "Total (refunded)" : "Total paid (INR)"}
          />

          {canCancel(booking) && (
            <button
              type="button"
              onClick={() => setConfirmCancel(true)}
              className="mt-8 rounded-lg border border-ink px-6 py-3 font-semibold hover:bg-surface"
            >
              Cancel reservation
            </button>
          )}
        </div>
      </div>

      <Modal
        open={confirmCancel}
        onClose={() => setConfirmCancel(false)}
        title="Cancel reservation"
        footer={
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setConfirmCancel(false)} className="px-4 py-3 font-semibold underline">
              Keep it
            </button>
            <button
              type="button"
              onClick={cancel}
              disabled={cancelling}
              className="rounded-lg bg-ink px-6 py-3 font-semibold text-white disabled:opacity-50"
            >
              {cancelling ? "Cancelling…" : "Yes, cancel"}
            </button>
          </div>
        }
      >
        <p>
          Cancel your stay in {booking.listing.city} ({formatLongDate(booking.check_in)})? The dates will become
          available to other guests. This can&apos;t be undone.
        </p>
      </Modal>
    </Container>
  );
}
