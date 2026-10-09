"use client";

import { useState } from "react";

import { ListingPhoto } from "@/components/listings/ListingPhoto";

/** Swipeable photos for phones. Uses native scrolling with CSS scroll-snap,
 *  so swiping feels exactly like the phone's own photo apps. */
export function MobilePhotoSlider({
  images,
  title,
  onOpenGallery,
}: {
  images: string[];
  title: string;
  onOpenGallery: () => void;
}) {
  const [index, setIndex] = useState(0);

  function handleScroll(event: React.UIEvent<HTMLDivElement>) {
    const { scrollLeft, clientWidth } = event.currentTarget;
    setIndex(Math.round(scrollLeft / clientWidth));
  }

  return (
    <div className="relative -mx-6 md:hidden">
      <div onScroll={handleScroll} className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto">
        {images.map((src, i) => (
          <button
            key={`${src}-${i}`}
            type="button"
            onClick={onOpenGallery}
            className="aspect-[4/3] w-full shrink-0 snap-center"
          >
            <ListingPhoto src={src} alt={`${title} photo ${i + 1}`} eager={i === 0} className="h-full w-full" />
          </button>
        ))}
      </div>
      <span className="absolute bottom-3 right-3 rounded-md bg-black/60 px-2 py-0.5 text-xs font-semibold text-white">
        {index + 1} / {images.length}
      </span>
    </div>
  );
}
