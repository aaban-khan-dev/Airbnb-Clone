"use client";

import { ImageOff } from "lucide-react";
import { useState } from "react";

// A listing photo that falls back to a grey placeholder if the URL is broken.
// Plain <img> instead of next/image: hosts can paste photo URLs from any website.
export function ListingPhoto({
  src,
  alt,
  eager = false,
  className = "",
}: {
  src: string;
  alt: string;
  eager?: boolean;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className={`flex items-center justify-center bg-surface text-muted ${className}`}>
        <ImageOff size={28} strokeWidth={1.5} />
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      loading={eager ? "eager" : "lazy"}
      onError={() => setFailed(true)}
      className={`object-cover ${className}`}
    />
  );
}
