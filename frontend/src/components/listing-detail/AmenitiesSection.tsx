"use client";

import { useState } from "react";

import { Modal } from "@/components/ui/Modal";
import { AmenityIcon } from "@/components/ui/AmenityIcon";
import type { Amenity } from "@/lib/types";

const PREVIEW_COUNT = 10;

export function AmenitiesSection({ amenities }: { amenities: Amenity[] }) {
  const [showAll, setShowAll] = useState(false);

  return (
    <section className="py-10">
      <h2 className="mb-6 text-[22px] font-semibold">What this place offers</h2>
      <ul className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
        {amenities.slice(0, PREVIEW_COUNT).map((amenity) => (
          <AmenityRow key={amenity.id} amenity={amenity} />
        ))}
      </ul>
      {amenities.length > PREVIEW_COUNT && (
        <button
          type="button"
          onClick={() => setShowAll(true)}
          className="mt-8 rounded-lg border border-ink px-6 py-3 font-semibold hover:bg-surface"
        >
          Show all {amenities.length} amenities
        </button>
      )}

      <Modal open={showAll} onClose={() => setShowAll(false)} title="What this place offers">
        <ul className="divide-y divide-line">
          {amenities.map((amenity) => (
            <AmenityRow key={amenity.id} amenity={amenity} className="py-5" />
          ))}
        </ul>
      </Modal>
    </section>
  );
}

function AmenityRow({ amenity, className = "" }: { amenity: Amenity; className?: string }) {
  return (
    <li className={`flex items-center gap-4 ${className}`}>
      <AmenityIcon iconKey={amenity.icon} size={24} strokeWidth={1.5} />
      {amenity.name}
    </li>
  );
}
