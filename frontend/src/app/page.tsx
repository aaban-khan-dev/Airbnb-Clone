"use client";

import { Container } from "@/components/ui/Container";
import { useCurrentUser } from "@/context/UserContext";

// Temporary home page. Phase 3 replaces it with the listings grid.
export default function HomePage() {
  const { currentUser, loading } = useCurrentUser();

  return (
    <Container className="py-12">
      <h1 className="text-2xl font-semibold">
        {loading ? "Loading…" : `Welcome, ${currentUser?.name ?? "guest"}`}
      </h1>
      <p className="mt-2 text-muted">The listings grid arrives in Phase 3.</p>
    </Container>
  );
}
