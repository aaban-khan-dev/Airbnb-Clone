"use client";

// Loaded only in the browser (see LocationMap.tsx): Leaflet needs `window`.
import { Circle, MapContainer, TileLayer } from "react-leaflet";

import { OSM_TILES } from "@/components/map/ListingsMap";

/** Approximate location, like Airbnb: a shaded circle instead of the exact address. */
export default function AreaMap({ latitude, longitude }: { latitude: number; longitude: number }) {
  return (
    <div className="isolate h-full w-full overflow-hidden rounded-xl">
      <MapContainer
        center={[latitude, longitude]}
        zoom={13}
        scrollWheelZoom={false} // don't hijack page scrolling
        className="h-full w-full"
      >
        <TileLayer url={OSM_TILES.url} attribution={OSM_TILES.attribution} />
        <Circle
          center={[latitude, longitude]}
          radius={800}
          pathOptions={{ color: "#ff385c", fillColor: "#ff385c", fillOpacity: 0.2, weight: 2 }}
        />
      </MapContainer>
    </div>
  );
}
