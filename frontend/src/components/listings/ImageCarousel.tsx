"use client";

import { ChevronLeft, ChevronRight, ImageOff } from "lucide-react";
import { useState } from "react";

import { ListingPhoto } from "@/components/listings/ListingPhoto";

// Photo slider inside a listing card: arrows appear on hover, dots show the position
export function ImageCarousel({ images, alt }: { images: string[]; alt: string }) {
  const [index, setIndex] = useState(0);

  if (images.length === 0) return <PhotoPlaceholder />;

  function go(event: React.MouseEvent, step: number) {
    event.preventDefault(); // the card is a link: don't open the listing
    event.stopPropagation();
    setIndex((i) => Math.min(Math.max(i + step, 0), images.length - 1));
  }

  return (
    <div className="relative h-full w-full">
      {/* All photos sit side by side; the track slides left by 100% per photo */}
      <div
        className="flex h-full transition-transform duration-300 ease-out"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {images.map((src, i) => (
          <ListingPhoto
            key={`${src}-${i}`}
            src={src}
            alt={`${alt} photo ${i + 1}`}
            eager={i === 0}
            className="h-full w-full shrink-0"
          />
        ))}
      </div>

      {index > 0 && (
        <ArrowButton side="left" onClick={(e) => go(e, -1)}>
          <ChevronLeft size={14} strokeWidth={3} />
        </ArrowButton>
      )}
      {index < images.length - 1 && (
        <ArrowButton side="right" onClick={(e) => go(e, 1)}>
          <ChevronRight size={14} strokeWidth={3} />
        </ArrowButton>
      )}

      {images.length > 1 && (
        <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
          {images.map((src, i) => (
            <span
              key={`${src}-dot-${i}`}
              className={`h-1.5 w-1.5 rounded-full bg-white ${i === index ? "opacity-100" : "opacity-60"}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function PhotoPlaceholder() {
  return (
    <div className="flex h-full w-full shrink-0 items-center justify-center bg-surface text-muted">
      <ImageOff size={28} strokeWidth={1.5} />
    </div>
  );
}

function ArrowButton({
  side,
  onClick,
  children,
}: {
  side: "left" | "right";
  onClick: (event: React.MouseEvent) => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={side === "left" ? "Previous photo" : "Next photo"}
      className={`absolute top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 opacity-0 shadow transition-opacity hover:scale-105 hover:bg-white group-hover:opacity-100 ${
        side === "left" ? "left-3" : "right-3"
      }`}
    >
      {children}
    </button>
  );
}
