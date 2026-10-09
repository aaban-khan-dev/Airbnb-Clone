"use client";

import { Ban } from "lucide-react";

import { ListingPhoto } from "@/components/listings/ListingPhoto";
import type { ListingFormValues } from "@/lib/types";

type Room = ListingFormValues["bedroom_details"][number];

// One row per bedroom (the count comes from the Bedrooms counter): what beds it has,
// and which of the listing's photos shows it. Picking from the photos already added
// means hosts don't paste the same link twice.
export function BedroomsInput({
  rooms,
  photos,
  onChange,
}: {
  rooms: Room[];
  photos: string[];
  onChange: (rooms: Room[]) => void;
}) {
  if (rooms.length === 0) {
    return <p className="text-sm text-muted">Set the number of bedrooms above to describe them here.</p>;
  }

  function update(index: number, change: Partial<Room>) {
    onChange(rooms.map((room, i) => (i === index ? { ...room, ...change } : room)));
  }

  return (
    <div className="space-y-6">
      <p className="-mt-3 text-sm text-muted">
        Shown as &quot;Where you&apos;ll sleep&quot; on your listing. Fill in every bedroom, or leave them all empty.
      </p>
      {rooms.map((room, i) => (
        <div key={i} className="rounded-xl border border-line p-4">
          <label className="block">
            <span className="mb-1 block text-sm font-semibold">Bedroom {i + 1}</span>
            <input
              value={room.beds}
              maxLength={100}
              onChange={(e) => update(i, { beds: e.target.value })}
              placeholder="e.g. 1 queen bed, 1 single bed"
              className="w-full rounded-lg border border-line-strong bg-canvas px-4 py-3 outline-none focus:border-ink"
            />
          </label>

          <p className="mb-2 mt-4 text-sm font-semibold">Photo</p>
          {photos.length === 0 ? (
            <p className="text-sm text-muted">Add photos above first, then pick one for this room.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              <PhotoChoice
                selected={!photos.includes(room.image_url)}
                onClick={() => update(i, { image_url: "" })}
                label="No photo"
              >
                <Ban size={18} className="text-muted" />
              </PhotoChoice>
              {photos.map((url, photoIndex) => (
                <PhotoChoice
                  key={url}
                  selected={room.image_url === url}
                  onClick={() => update(i, { image_url: url })}
                  label={`Use photo ${photoIndex + 1}`}
                >
                  <ListingPhoto src={url} alt="" className="h-full w-full" />
                </PhotoChoice>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function PhotoChoice({
  selected,
  onClick,
  label,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={selected}
      title={label}
      className={`flex h-14 w-20 items-center justify-center overflow-hidden rounded-lg border ${
        selected ? "border-ink ring-2 ring-ink" : "border-line opacity-70 hover:opacity-100"
      }`}
    >
      {children}
    </button>
  );
}
