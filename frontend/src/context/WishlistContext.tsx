"use client";

import { useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { toast } from "sonner";

import { useCurrentUser } from "@/context/UserContext";
import { api } from "@/lib/api";

type WishlistContextValue = {
  isSaved: (listingId: number) => boolean;
  toggle: (listingId: number) => Promise<void>;
};

const WishlistContext = createContext<WishlistContextValue | null>(null);

// Knows which listings the current user has saved, so every heart on the page is in sync
export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const { currentUser } = useCurrentUser();
  const router = useRouter();
  // Remember whose ids these are, so a user switch never shows the previous user's hearts
  const [saved, setSaved] = useState<{ userId: number; ids: Set<number> } | null>(null);
  const userId = currentUser?.id ?? null;

  useEffect(() => {
    if (userId === null) return;
    api
      .get<number[]>("/api/wishlist/ids")
      .then((ids) => setSaved({ userId, ids: new Set(ids) }))
      .catch(() => setSaved({ userId, ids: new Set() }));
  }, [userId]);

  const ids = saved && saved.userId === userId ? saved.ids : null;

  const isSaved = useCallback((listingId: number) => ids?.has(listingId) ?? false, [ids]);

  const toggle = useCallback(
    async (listingId: number) => {
      if (userId === null || ids === null) return;
      const wasSaved = ids.has(listingId);

      // Optimistic update: flip the heart now, undo it if the request fails
      const next = new Set(ids);
      if (wasSaved) next.delete(listingId);
      else next.add(listingId);
      setSaved({ userId, ids: next });

      try {
        if (wasSaved) {
          await api.delete(`/api/wishlist/${listingId}`);
          toast("Removed from your wishlist");
        } else {
          await api.put(`/api/wishlist/${listingId}`);
          toast.success("Saved to your wishlist", {
            action: { label: "View", onClick: () => router.push("/wishlists") },
          });
        }
      } catch {
        setSaved({ userId, ids });
        toast.error("Couldn't update your wishlist. Please try again.");
      }
    },
    [ids, userId, router],
  );

  return <WishlistContext.Provider value={{ isSaved, toggle }}>{children}</WishlistContext.Provider>;
}

export function useWishlist(): WishlistContextValue {
  const context = useContext(WishlistContext);
  if (!context) throw new Error("useWishlist must be used inside <WishlistProvider>");
  return context;
}
