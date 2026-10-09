"use client";

import { Menu } from "lucide-react";
import Link from "next/link";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";

import { ThemeSwitcher } from "@/components/layout/ThemeSwitcher";
import { Avatar } from "@/components/ui/Avatar";
import { useCurrentUser } from "@/context/UserContext";
import { useClickOutside } from "@/hooks/useClickOutside";

export function UserMenu() {
  const { users, currentUser, switchUser } = useCurrentUser();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => setOpen(false), []);
  useClickOutside(menuRef, close, open); // close on outside click or Escape


  return (
    <div ref={menuRef} className="relative">
      {/* The pill button: hamburger icon + avatar */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label="Open user menu"
        className="flex items-center gap-3 rounded-full border border-line py-1.5 pl-3 pr-1.5 transition-shadow hover:shadow-pill"
      >
        <Menu size={16} strokeWidth={2.5} />
        <Avatar name={currentUser?.name ?? "?"} src={currentUser?.avatar_url ?? null} />
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-72 overflow-hidden rounded-xl bg-canvas py-2 text-sm shadow-card ring-1 ring-line">
          {currentUser && (
            <p className="px-4 py-2 text-xs text-muted">
              Logged in as <span className="font-semibold text-ink">{currentUser.name}</span>
            </p>
          )}

          <MenuLink href="/trips" onClick={close} bold>
            Trips
          </MenuLink>
          <MenuLink href="/wishlists" onClick={close} bold>
            Wishlists
          </MenuLink>
          <MenuLink href="/messages" onClick={close} bold>
            Messages
          </MenuLink>

          <Divider />

          <MenuLink href="/host" onClick={close}>
            {currentUser?.is_host ? "Manage listings" : "Become a host"}
          </MenuLink>
          <button
            type="button"
            className="block w-full px-4 py-3 text-left hover:bg-surface"
            onClick={() => {
              toast("Account settings are coming soon");
              close();
            }}
          >
            Account
          </button>

          <div className="px-4 py-2">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Appearance</p>
            <ThemeSwitcher />
          </div>

          <Divider />

          {/* Mock authentication: pick any seeded user to act as them */}
          <p className="px-4 pb-1 pt-2 text-xs font-semibold uppercase tracking-wide text-muted">
            Switch user (demo)
          </p>
          <div className="max-h-64 overflow-y-auto">
            {users.map((user) => (
              <button
                key={user.id}
                type="button"
                onClick={() => {
                  switchUser(user.id);
                  close();
                }}
                className={`flex w-full items-center gap-3 px-4 py-2 text-left hover:bg-surface ${
                  user.id === currentUser?.id ? "bg-surface" : ""
                }`}
              >
                <Avatar name={user.name} src={user.avatar_url} size={28} />
                <span className="flex-1">{user.name}</span>
                <span className="text-xs text-muted">{user.is_host ? "Host" : "Guest"}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function MenuLink({
  href,
  onClick,
  bold = false,
  children,
}: {
  href: string;
  onClick: () => void;
  bold?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`block px-4 py-3 hover:bg-surface ${bold ? "font-semibold" : ""}`}
    >
      {children}
    </Link>
  );
}

function Divider() {
  return <hr className="my-2 border-line" />;
}
