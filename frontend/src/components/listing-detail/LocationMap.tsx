// "Where you'll be": an embedded OpenStreetMap with a marker. No API key or map
// library needed; the brief allows a static/basic map.
export function LocationMap({
  latitude,
  longitude,
  label,
}: {
  latitude: number;
  longitude: number;
  label: string;
}) {
  const bbox = [longitude - 0.06, latitude - 0.035, longitude + 0.06, latitude + 0.035].join(",");
  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${latitude},${longitude}`;

  return (
    <section className="py-10">
      <h2 className="mb-2 text-[22px] font-semibold">Where you&apos;ll be</h2>
      <p className="mb-6">{label}</p>
      <iframe
        title={`Map of ${label}`}
        src={src}
        loading="lazy"
        className="h-[360px] w-full rounded-xl border-0 md:h-[480px]"
      />
    </section>
  );
}
