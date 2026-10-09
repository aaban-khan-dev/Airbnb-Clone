"use client";

import { type RefObject, useEffect } from "react";

type Ref = RefObject<HTMLElement | null>;

/** Calls `onClose` when the user clicks outside the given element(s) or presses Escape,
 *  while `active`. Pass several refs when one widget is split across the page
 *  (e.g. a button in the navbar plus a sheet rendered elsewhere). */
export function useClickOutside(refs: Ref | Ref[], onClose: () => void, active: boolean) {
  useEffect(() => {
    if (!active) return;
    const list = Array.isArray(refs) ? refs : [refs];
    function handleClick(event: MouseEvent) {
      const inside = list.some((ref) => ref.current?.contains(event.target as Node));
      if (!inside) onClose();
    }
    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [refs, onClose, active]);
}
