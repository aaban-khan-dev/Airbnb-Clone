"use client";

// Loaded only in the browser (see SearchMap.tsx): Leaflet needs `window`.
import L from "leaflet";
import { Star } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";

import { ListingPhoto } from "@/components/listings/ListingPhoto";
import { formatPrice } from "@/lib/format";
import type { ListingCard } from "@/lib/types";

export const OSM_TILES = {
  url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
};

/** Search results as price pins. Clicking a pin opens a mini card linking to the listing. */
export default function ListingsMap({
  listings,
  linkQuery,
}: {
  listings: ListingCard[];
  linkQuery: string; // e.g. "?check_in=...&check_out=..." carried into the listing link
}) {
  const [activeId, setActiveId] = useState<number | null>(null);
  const points = useMemo(
    () => listings.map((l) => [l.latitude, l.longitude] as [number, number]),
    [listings],
  );

  return (
    // "isolate" keeps Leaflet's high z-indexes inside the map, so it never covers the navbar
    <div className="isolate h-full w-full overflow-hidden rounded-xl">
      <MapContainer center={[22.5, 79]} zoom={5} zoomSnap={0.5} scrollWheelZoom className="h-full w-full">
        <TileLayer url={OSM_TILES.url} attribution={OSM_TILES.attribution} />
        <FitToListings points={points} />
        {listings.map((listing) => (
          <Marker
            key={listing.id}
            position={[listing.latitude, listing.longitude]}
            icon={pricePin(listing.price_per_night, listing.id === activeId)}
            zIndexOffset={listing.id === activeId ? 1000 : 0}
            eventHandlers={{
              popupopen: () => setActiveId(listing.id),
              popupclose: () => setActiveId((id) => (id === listing.id ? null : id)),
            }}
          >
            <Popup closeButton={false} offset={[0, -12]}>
              <MiniCard listing={listing} href={`/listings/${listing.id}${linkQuery}`} />
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

/** A "₹18,500" pill instead of Leaflet's default blue marker. Styles are in globals.css. */
function pricePin(price: number, active: boolean) {
  return L.divIcon({
    className: "", // drop Leaflet's default white box
    html: `<span class="price-pin${active ? " is-active" : ""}">${formatPrice(price)}</span>`,
    iconSize: [0, 0],
  });
}

/** Zoom the map so every result is visible whenever the results change. */
function FitToListings({ points }: { points: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (points.length === 0) return;
    map.fitBounds(L.latLngBounds(points), { padding: [56, 56], maxZoom: 12 });
  }, [map, points]);
  return null;
}

function MiniCard({ listing, href }: { listing: ListingCard; href: string }) {
  return (
    <Link href={href} className="block !text-inherit">
      <ListingPhoto src={listing.image_urls[0] ?? ""} alt={listing.title} className="aspect-[3/2] w-full" />
      <div className="p-3 text-sm">
        <div className="flex justify-between gap-2">
          <span className="truncate font-semibold">
            {listing.city}, {listing.state}
          </span>
          <span className="flex shrink-0 items-center gap-1">
            <Star size={11} className="fill-current" />
            {listing.rating !== null ? listing.rating.toFixed(2) : "New"}
          </span>
        </div>
        <p className="truncate text-muted">{listing.title}</p>
        <p className="mt-1">
          <span className="font-semibold">{formatPrice(listing.price_per_night)}</span> night
        </p>
      </div>
    </Link>
  );
}
