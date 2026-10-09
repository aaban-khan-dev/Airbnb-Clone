"use client";

import { Toaster } from "sonner";

import { useTheme } from "@/context/ThemeContext";

// Toasts follow the current light/dark theme
export function ThemedToaster() {
  const { resolved } = useTheme();
  return (
    <Toaster
      theme={resolved}
      position="bottom-left"
      offset={{ bottom: 24 }}
      mobileOffset={{ bottom: 80 }} // above the mobile tab bar
      toastOptions={{ className: "!rounded-xl !text-sm !font-semibold" }}
    />
  );
}
