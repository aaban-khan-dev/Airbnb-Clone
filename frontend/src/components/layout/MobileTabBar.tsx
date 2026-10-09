"use client";

import { Heart, House, Luggage, Search } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/", label: "Explore", Icon: Search },
  { href: "/wishlists", label: "Wishlists", Icon: Heart },
  { href: "/trips", label: "Trips", Icon: Luggage },
  { href: "/host", label: "Host", Icon: House },
];

/** Airbnb-app style bottom navigation, only on phones. */
export function MobileTabBar() {
  const pathname = usePathname();

  // Listing and checkout pages show their own sticky "Reserve" bar here instead
  if (pathname.startsWith("/listings/") || pathname.startsWith("/book/")) return null;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-canvas md:hidden">
      <ul className="flex h-16 items-center justify-around">
        {TABS.map(({ href, label, Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <li key={href}>
              <Link
                href={href}
                className={`flex flex-col items-center gap-1 text-[11px] font-semibold ${
                  active ? "text-brand" : "text-muted"
                }`}
              >
                <Icon size={22} strokeWidth={active ? 2.4 : 1.8} />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
