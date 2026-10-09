"use client";

import { Heart } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { ListingCard } from "@/components/listings/ListingCard";
import { Container } from "@/components/ui/Container";
import { useCurrentUser } from "@/context/UserContext";
import { useWishlist } from "@/context/WishlistContext";
import { api } from "@/lib/api";
import type { ListingCard as ListingCardData } from "@/lib/types";

export default function WishlistsPage() {
  const { currentUser } = useCurrentUser();
  return (
    <Container className="py-10">
      <h1 className="mb-8 text-[32px] font-semibold">Wishlist</h1>
      {currentUser && <SavedListings key={currentUser.id} />}
    </Container>
  );
}

function SavedListings() {
  const { isSaved } = useWishlist();
  const [listings, setListings] = useState<ListingCardData[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<ListingCardData[]>("/api/wishlist")
      .then(setListings)
      .catch((err: Error) => setError(err.message));
  }, []);

  if (error) return <p className="text-muted">Couldn&apos;t load your wishlist: {error}</p>;
  if (!listings) return <div className="h-60 animate-pulse rounded-xl bg-surface" />;

  // Unsaving a heart on this page removes the card straight away
  const visible = listings.filter((listing) => isSaved(listing.id));

  if (visible.length === 0) {
    return (
      <div className="py-8">
        <h2 className="text-[22px] font-semibold">Create your first wishlist</h2>
        <p className="mt-2 flex items-center gap-1 text-muted">
          As you search, tap the <Heart size={16} /> icon to save your favourite places here.
        </p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-lg border border-ink px-6 py-3 font-semibold hover:bg-surface"
        >
          Start exploring
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {visible.map((listing) => (
        <ListingCard key={listing.id} listing={listing} />
      ))}
    </div>
  );
}
