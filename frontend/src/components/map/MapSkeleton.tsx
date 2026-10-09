import { MapPin } from "lucide-react";

export function MapSkeleton() {
  return (
    <div className="flex h-full w-full animate-pulse items-center justify-center rounded-xl bg-surface text-muted">
      <MapPin size={28} strokeWidth={1.5} />
    </div>
  );
}
