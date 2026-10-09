"use client";

import { Globe } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { toast } from "sonner";

import { Logo } from "@/components/layout/Logo";
import { UserMenu } from "@/components/layout/UserMenu";
import { SearchPill } from "@/components/search/SearchPill";
import { Container } from "@/components/ui/Container";
import { useCurrentUser } from "@/context/UserContext";

export function Navbar() {
  const pathname = usePathname();
  const { currentUser } = useCurrentUser();

  // Guest vs host mode comes from the URL: everything under /host is the host side
  const inHostMode = pathname.startsWith("/host");

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white">
      <Container className="flex h-20 items-center justify-between gap-4">
        <div className="flex flex-1 items-center">
          <Logo />
        </div>

        {/* Search only makes sense on the guest side */}
        {!inHostMode && (
          <div className="hidden md:block">
            <SearchPill />
          </div>
        )}

        <div className="flex flex-1 items-center justify-end gap-1">
          <Link
            href={inHostMode ? "/" : "/host"}
            className="hidden rounded-full px-4 py-3 text-sm font-semibold hover:bg-surface sm:block"
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
            className="mr-2 rounded-full p-3 hover:bg-surface"
          >
            <Globe size={16} />
          </button>
          <UserMenu />
        </div>
      </Container>
    </header>
  );
}
