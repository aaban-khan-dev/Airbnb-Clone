"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { EMPTY_LISTING, ListingForm } from "@/components/host/ListingForm";
import { Container } from "@/components/ui/Container";
import { useCurrentUser } from "@/context/UserContext";
import { api } from "@/lib/api";
import type { ListingFormValues } from "@/lib/types";

export default function NewListingPage() {
  const router = useRouter();
  const { refreshUsers } = useCurrentUser();

  async function create(values: ListingFormValues) {
    const listing = await api.post<{ id: number }>("/api/host/listings", values);
    await refreshUsers(); // a first listing turns a guest into a host
    toast.success("Your listing is live!");
    router.push(`/listings/${listing.id}`);
  }

  return (
    <Container className="max-w-3xl pt-10">
      <h1 className="text-[32px] font-semibold">Create a listing</h1>
      <p className="mt-1 text-muted">Tell guests about your place. You can change everything later.</p>
      <ListingForm initialValues={EMPTY_LISTING} submitLabel="Publish listing" onSubmit={create} />
    </Container>
  );
}
