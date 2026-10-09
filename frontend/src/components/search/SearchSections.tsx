"use client";

import { MapPin } from "lucide-react";

import { Counter } from "@/components/ui/Counter";
import { POPULAR_DESTINATIONS } from "@/lib/search";

// Pieces of the search UI shared by the desktop dropdown and the mobile sheet

export function DestinationSuggestions({ onPick }: { onPick: (name: string) => void }) {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold">Suggested destinations</p>
      {POPULAR_DESTINATIONS.map((place) => (
        <button
          key={place.name}
          type="button"
          onClick={() => onPick(place.name)}
          className="flex w-full items-center gap-4 rounded-xl p-2 text-left hover:bg-surface"
        >
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-surface">
            <MapPin size={20} />
          </span>
          <span>
            <span className="block text-sm">{place.name}</span>
            <span className="block text-xs text-muted">{place.hint}</span>
          </span>
        </button>
      ))}
    </div>
  );
}

export function GuestCounters({
  adults,
  childCount,
  onAdults,
  onChildren,
}: {
  adults: number;
  childCount: number;
  onAdults: (n: number) => void;
  onChildren: (n: number) => void;
}) {
  return (
    <div className="divide-y divide-line">
      <Counter label="Adults" description="Ages 13 or above" value={adults} onChange={onAdults} />
      <Counter
        label="Children"
        description="Ages 2–12"
        value={childCount}
        onChange={(n) => {
          onChildren(n);
          if (n > 0 && adults === 0) onAdults(1); // children need an adult
        }}
      />
    </div>
  );
}
