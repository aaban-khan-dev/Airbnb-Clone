"use client";

import { Heart } from "lucide-react";

import { useWishlist } from "@/context/WishlistContext";

/** Save/unsave a listing. "overlay" sits on a photo; "text" is the listing page's Save button. */
export function HeartButton({ listingId, variant = "overlay" }: { listingId: number; variant?: "overlay" | "text" }) {
  const { isSaved, toggle } = useWishlist();
  const saved = isSaved(listingId);

  function handleClick(event: React.MouseEvent) {
    event.preventDefault(); // inside a card link: don't open the listing
    event.stopPropagation();
    void toggle(listingId);
  }

  if (variant === "text") {
    return (
      <button
        type="button"
        onClick={handleClick}
        aria-pressed={saved}
        className="flex items-center gap-2 rounded-lg px-3 py-2 underline hover:bg-surface"
      >
        <Heart size={16} className={saved ? "fill-brand text-brand" : ""} /> {saved ? "Saved" : "Save"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={saved ? "Remove from wishlist" : "Save to wishlist"}
      aria-pressed={saved}
      className="transition-transform hover:scale-110 active:scale-90"
    >
      <Heart
        size={24}
        strokeWidth={2}
        className={saved ? "fill-brand text-white" : "fill-black/50 text-white"}
      />
    </button>
  );
}
