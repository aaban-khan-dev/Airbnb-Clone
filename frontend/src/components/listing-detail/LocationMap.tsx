"use client";

import dynamic from "next/dynamic";

import { MapSkeleton } from "@/components/map/MapSkeleton";

// Leaflet touches `window`, so the map is only loaded in the browser
const AreaMap = dynamic(() => import("@/components/map/AreaMap"), {
  ssr: false,
  loading: () => <MapSkeleton />,
});

/** "Where you'll be": an interactive OpenStreetMap showing the approximate area. */
export function LocationMap({
  latitude,
  longitude,
  label,
}: {
  latitude: number;
  longitude: number;
  label: string;
}) {
  return (
    <section className="py-10">
      <h2 className="mb-2 text-[22px] font-semibold">Where you&apos;ll be</h2>
      <p className="mb-6">{label}</p>
      <div className="h-[360px] md:h-[480px]">
        <AreaMap latitude={latitude} longitude={longitude} />
      </div>
      <p className="mt-4 text-sm text-muted">Exact location provided after booking.</p>
    </section>
  );
}
