"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { ListingForm } from "@/components/host/ListingForm";
import { Container } from "@/components/ui/Container";
import { useCurrentUser } from "@/context/UserContext";
import { api } from "@/lib/api";
import type { ListingFormValues } from "@/lib/types";

export default function EditListingPage() {
  const { currentUser } = useCurrentUser();
  // key: if the user switches account, reload (the new user may not own this listing)
  return currentUser ? <EditListing key={currentUser.id} /> : null;
}

function EditListing() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [values, setValues] = useState<ListingFormValues | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<ListingFormValues>(`/api/host/listings/${id}`)
      .then(setValues)
      .catch((err: Error) => setError(err.message));
  }, [id]);

  async function save(next: ListingFormValues) {
    await api.put(`/api/host/listings/${id}`, next);
    toast.success("Changes saved");
    router.push("/host");
  }

  if (error) {
    return (
      <Container className="py-24">
        <h1 className="text-2xl font-semibold">You can only edit your own listings</h1>
        <p className="mt-2 text-muted">{error}</p>
        <Link href="/host" className="mt-4 inline-block font-semibold underline">
          Back to your listings
        </Link>
      </Container>
    );
  }

  return (
    <Container className="max-w-3xl pt-10">
      <h1 className="text-[32px] font-semibold">Edit listing</h1>
      {values ? (
        <ListingForm initialValues={values} submitLabel="Save changes" onSubmit={save} />
      ) : (
        <div className="mt-8 h-96 animate-pulse rounded-xl bg-surface" />
      )}
    </Container>
  );
}
