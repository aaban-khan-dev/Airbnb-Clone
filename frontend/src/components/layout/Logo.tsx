import { House } from "lucide-react";
import Link from "next/link";

import { APP_NAME } from "@/lib/config";

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-1.5 text-brand" aria-label={`${APP_NAME} home`}>
      <House size={30} strokeWidth={2.4} />
      {/* Wordmark hidden on small screens, like Airbnb */}
      <span className="hidden text-2xl font-bold tracking-tight lg:block">{APP_NAME}</span>
    </Link>
  );
}
