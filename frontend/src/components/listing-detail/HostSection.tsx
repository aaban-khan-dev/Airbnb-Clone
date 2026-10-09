import { Medal } from "lucide-react";

import { Avatar } from "@/components/ui/Avatar";
import type { Host } from "@/lib/types";

// "Meet your host" card near the bottom of the page
export function HostSection({ host, reviewCount }: { host: Host; reviewCount: number }) {
  return (
    <section className="py-10">
      <h2 className="mb-6 text-[22px] font-semibold">Meet your host</h2>
      <div className="flex flex-col gap-8 md:flex-row md:items-start">
        <div className="flex w-full max-w-sm items-center gap-6 rounded-3xl p-8 shadow-card">
          <div className="flex flex-col items-center text-center">
            <Avatar name={host.name} src={host.avatar_url} size={104} />
            <p className="mt-3 text-2xl font-semibold">{host.name.split(" ")[0]}</p>
            {host.is_superhost && (
              <p className="flex items-center gap-1 text-sm font-semibold">
                <Medal size={14} /> Superhost
              </p>
            )}
          </div>
          <div className="ml-auto text-sm">
            <p className="text-xl font-semibold">{reviewCount}</p>
            <p className="text-xs">Reviews on this place</p>
          </div>
        </div>
        <div className="max-w-md">
          {host.is_superhost && (
            <>
              <p className="font-semibold">{host.name.split(" ")[0]} is a Superhost</p>
              <p className="mt-1 text-muted">
                Superhosts are experienced, highly rated hosts who are committed to providing great stays.
              </p>
            </>
          )}
          {host.bio && <p className="mt-4">{host.bio}</p>}
          <button
            type="button"
            disabled
            title="Messaging isn't available in this demo"
            className="mt-6 cursor-not-allowed rounded-lg bg-surface px-6 py-3 font-semibold text-muted"
          >
            Message host (coming soon)
          </button>
        </div>
      </div>
    </section>
  );
}
