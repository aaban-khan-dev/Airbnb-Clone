"use client";

import { Star } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { ApiError, api } from "@/lib/api";
import type { Booking } from "@/lib/types";

const LABELS = ["", "Terrible", "Poor", "Okay", "Good", "Excellent"];

/** "How was your stay?" form, shown on completed trips that haven't been reviewed. */
export function ReviewForm({ bookingId, onReviewed }: { bookingId: number; onReviewed: (b: Booking) => void }) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (rating === 0) return toast.error("Choose a star rating");
    if (comment.trim().length < 10) return toast.error("Write at least 10 characters");
    setSubmitting(true);
    try {
      onReviewed(await api.post<Booking>(`/api/bookings/${bookingId}/review`, { rating, comment }));
      toast.success("Thanks for your review!");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Couldn't post your review");
      setSubmitting(false);
    }
  }

  const shown = hovered || rating;

  return (
    <form onSubmit={submit} className="rounded-xl border border-line p-5">
      <h3 className="text-lg font-semibold">How was your stay?</h3>
      <div className="mt-3 flex items-center gap-1" onMouseLeave={() => setHovered(0)}>
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            key={value}
            type="button"
            aria-label={`${value} star${value > 1 ? "s" : ""}`}
            onClick={() => setRating(value)}
            onMouseEnter={() => setHovered(value)}
          >
            <Star size={28} strokeWidth={1.5} className={value <= shown ? "fill-ink text-ink" : "text-muted"} />
          </button>
        ))}
        <span className="ml-3 text-sm font-semibold">{LABELS[shown]}</span>
      </div>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={4}
        maxLength={1000}
        placeholder="Tell future guests what you loved and what could be better"
        className="mt-4 w-full rounded-lg border border-line-strong px-4 py-3 outline-none focus:border-ink"
      />
      <button
        type="submit"
        disabled={submitting}
        className="mt-3 rounded-lg bg-ink px-6 py-3 font-semibold text-canvas disabled:opacity-50"
      >
        {submitting ? "Posting…" : "Post review"}
      </button>
    </form>
  );
}
