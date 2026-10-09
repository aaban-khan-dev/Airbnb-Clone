"use client";

import { useEffect, useState } from "react";

/**
 * True once the page has scrolled down. Two thresholds (collapse after 24px,
 * expand again only near the very top) stop the header flickering when its own
 * change in height nudges the scroll position back and forth around one value.
 */
export function useScrolledPast(collapseAt = 24, expandAt = 4): boolean {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function onScroll() {
      const y = window.scrollY;
      setScrolled((wasScrolled) => (wasScrolled ? y > expandAt : y > collapseAt));
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [collapseAt, expandAt]);

  return scrolled;
}
