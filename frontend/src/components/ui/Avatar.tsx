"use client";

import { useState } from "react";

// Shows the user's photo, or their first initial if there's no photo or it fails to load
export function Avatar({
  name,
  src,
  size = 32,
}: {
  name: string;
  src: string | null;
  size?: number;
}) {
  // Remember which URL failed, so switching to another user retries their photo
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  if (!src || failedSrc === src) {
    return (
      <span
        className="flex shrink-0 items-center justify-center rounded-full bg-ink font-semibold text-white"
        style={{ width: size, height: size, fontSize: size * 0.42 }}
      >
        {name.charAt(0).toUpperCase()}
      </span>
    );
  }

  return (
    // Plain <img> instead of next/image: photos can come from any URL a host types in
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={name}
      width={size}
      height={size}
      onError={() => setFailedSrc(src)}
      className="shrink-0 rounded-full object-cover"
      style={{ width: size, height: size }}
    />
  );
}
