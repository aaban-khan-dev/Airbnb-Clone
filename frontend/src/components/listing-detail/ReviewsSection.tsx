"use client";

import { format, parseISO } from "date-fns";
import { Star } from "lucide-react";
import { useState } from "react";

import { Avatar } from "@/components/ui/Avatar";
import { Modal } from "@/components/ui/Modal";
import { plural } from "@/lib/format";
import type { Review } from "@/lib/types";

const PREVIEW_COUNT = 6;

export function ReviewsSection({ reviews, rating }: { reviews: Review[]; rating: number | null }) {
  const [showAll, setShowAll] = useState(false);

  if (reviews.length === 0) {
    return (
      <section id="reviews" className="py-10">
        <h2 className="text-[22px] font-semibold">No reviews (yet)</h2>
        <p className="mt-2 text-muted">This place is new. Be one of the first guests to stay here.</p>
      </section>
    );
  }

  return (
    <section id="reviews" className="py-10">
      <h2 className="mb-8 flex items-center gap-2 text-[22px] font-semibold">
        <Star size={20} className="fill-ink" />
        {rating?.toFixed(2)} · {plural(reviews.length, "review")}
      </h2>

      <div className="grid grid-cols-1 gap-x-16 gap-y-10 md:grid-cols-2">
        {reviews.slice(0, PREVIEW_COUNT).map((review) => (
          <ReviewCard key={review.id} review={review} clamp />
        ))}
      </div>

      {reviews.length > PREVIEW_COUNT && (
        <button
          type="button"
          onClick={() => setShowAll(true)}
          className="mt-10 rounded-lg border border-ink px-6 py-3 font-semibold hover:bg-surface"
        >
          Show all {reviews.length} reviews
        </button>
      )}

      <Modal open={showAll} onClose={() => setShowAll(false)} title={plural(reviews.length, "review")}>
        <div className="space-y-8">
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      </Modal>
    </section>
  );
}

function ReviewCard({ review, clamp = false }: { review: Review; clamp?: boolean }) {
  return (
    <article>
      <div className="flex items-center gap-3">
        <Avatar name={review.author_name} src={review.author_avatar_url} size={48} />
        <div>
          <p className="font-semibold">{review.author_name}</p>
          <p className="text-sm text-muted">{format(parseISO(review.created_at), "MMMM yyyy")}</p>
        </div>
      </div>
      <div className="mt-3 flex gap-0.5" aria-label={`Rated ${review.rating} out of 5`}>
        {Array.from({ length: 5 }, (_, i) => (
          <Star key={i} size={10} className={i < review.rating ? "fill-ink text-ink" : "text-line"} />
        ))}
      </div>
      <p className={`mt-2 leading-relaxed ${clamp ? "line-clamp-3" : ""}`}>{review.comment}</p>
    </article>
  );
}
