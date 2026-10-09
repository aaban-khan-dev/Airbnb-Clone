import type { LucideProps } from "lucide-react";
import { createElement } from "react";

import { AMENITY_ICONS, FALLBACK_AMENITY_ICON } from "@/lib/amenities";

// Draws the icon for an amenity's icon key, e.g. <AmenityIcon iconKey="wifi" size={24} />
export function AmenityIcon({ iconKey, ...props }: { iconKey: string } & LucideProps) {
  return createElement(AMENITY_ICONS[iconKey] ?? FALLBACK_AMENITY_ICON, props);
}
