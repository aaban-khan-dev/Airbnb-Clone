"use client";

import { Grip } from "lucide-react";
import { useState } from "react";

import { ListingPhoto } from "@/components/listings/ListingPhoto";
import { Modal } from "@/components/ui/Modal";

// Airbnb's photo layout: one big photo on the left, four small ones on the right
export function PhotoGrid({ images, title }: { images: string[]; title: string }) {
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [main, ...rest] = images;
  const side = rest.slice(0, 4);

  if (!main) return <div className="aspect-[2/1] rounded-xl bg-surface" />;

  return (
    <>
      <div className="relative">
        <div className="grid h-[300px] grid-cols-1 gap-2 overflow-hidden rounded-xl md:h-[440px] md:grid-cols-4 md:grid-rows-2">
          <button
            type="button"
            onClick={() => setGalleryOpen(true)}
            className={`group overflow-hidden ${side.length ? "md:col-span-2 md:row-span-2" : "md:col-span-4 md:row-span-2"}`}
          >
            <ListingPhoto src={main} alt={title} eager className="h-full w-full transition group-hover:brightness-90" />
          </button>
          {side.map((src, i) => (
            <button
              key={`${src}-${i}`}
              type="button"
              onClick={() => setGalleryOpen(true)}
              className="group hidden overflow-hidden md:block"
            >
              <ListingPhoto
                src={src}
                alt={`${title} photo ${i + 2}`}
                className="h-full w-full transition group-hover:brightness-90"
              />
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setGalleryOpen(true)}
          className="absolute bottom-4 right-4 flex items-center gap-2 rounded-lg border border-ink bg-white px-4 py-1.5 text-sm font-semibold hover:bg-surface"
        >
          <Grip size={16} />
          Show all photos
        </button>
      </div>

      <Modal open={galleryOpen} onClose={() => setGalleryOpen(false)} title={`${images.length} photos`}>
        <div className="space-y-3">
          {images.map((src, i) => (
            <ListingPhoto key={`${src}-full-${i}`} src={src} alt={`${title} photo ${i + 1}`} className="w-full rounded-lg" />
          ))}
        </div>
      </Modal>
    </>
  );
}
