"use client";

import { Globe } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense } from "react";
import { toast } from "sonner";

import { HomeTabs } from "@/components/layout/HomeTabs";
import { Logo } from "@/components/layout/Logo";
import { UserMenu } from "@/components/layout/UserMenu";
import { SearchBar } from "@/components/search/SearchBar";
import { Container } from "@/components/ui/Container";
import { useCurrentUser } from "@/context/UserContext";
import { useScrolledPast } from "@/hooks/useScrolledPast";

export function Navbar() {
  const pathname = usePathname();
  const { currentUser } = useCurrentUser();

  // Guest vs host mode comes from the URL: everything under /host is the host side
  const inHostMode = pathname.startsWith("/host");

  // Airbnb's home page header: tall with a big search bar at the top of the page,
  // shrinking into the compact pill as soon as you scroll (desktop only)
  const scrolled = useScrolledPast();
  const expanded = pathname === "/" && !scrolled;

  return (
    <header
      className={`sticky top-0 z-40 border-b border-line bg-canvas transition-[height] duration-300 ${
        expanded ? "md:h-[168px]" : "md:h-20"
      }`}
    >
      <Container className="flex h-20 items-center justify-between gap-3 md:gap-4">
        {/* On phones the search pill takes the logo's place (Explore is in the tab bar) */}
        <div className={`${inHostMode ? "flex" : "hidden md:flex"} flex-1 items-center`}>
          <Logo />
        </div>

        {/* Search only makes sense on the guest side */}
        {!inHostMode && (
          <div className="relative min-w-0 flex-1 md:flex-none">
            {/* Tabs sit where the compact pill is, and swap with it on scroll */}
            <div className="absolute inset-0 hidden items-center justify-center md:flex">
              <HomeTabs visible={expanded} />
            </div>
            {/* SearchBar reads the URL's search params, which needs a Suspense boundary */}
            <Suspense>
              <SearchBar expanded={expanded} />
            </Suspense>
          </div>
        )}

        <div className="flex items-center justify-end gap-1 md:flex-1">
          <Link
            href={inHostMode ? "/" : "/host"}
            className="hidden rounded-full px-4 py-3 text-sm font-semibold hover:bg-surface lg:block"
          >
            {inHostMode
              ? "Switch to travelling"
              : currentUser?.is_host
                ? "Switch to hosting"
                : "Become a host"}
          </Link>
          <button
            type="button"
            aria-label="Choose a language and currency"
            onClick={() => toast("Languages and currencies are coming soon")}
            className="mr-2 hidden rounded-full p-3 hover:bg-surface md:block"
          >
            <Globe size={16} />
          </button>
          <UserMenu />
        </div>
      </Container>
    </header>
  );
}
