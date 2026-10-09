import type { Metadata } from "next";

import { Footer } from "@/components/layout/Footer";
import { MobileTabBar } from "@/components/layout/MobileTabBar";
import { Navbar } from "@/components/layout/Navbar";
import { ThemedToaster } from "@/components/layout/ThemedToaster";
import { THEME_INIT_SCRIPT, ThemeProvider } from "@/context/ThemeContext";
import { UserProvider } from "@/context/UserContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { APP_NAME } from "@/lib/config";

import "leaflet/dist/leaflet.css";
import "./globals.css";

export const metadata: Metadata = {
  title: `${APP_NAME} | Holiday rentals, cabins, beach houses & more`,
  description: "Find homes, cabins and villas for your next trip.",
};

// The root layout wraps every page: navbar on top, page content, footer at the bottom
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // suppressHydrationWarning: the theme script may add class="dark" before React loads
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="flex min-h-screen flex-col antialiased">
        <ThemeProvider>
          <UserProvider>
            <WishlistProvider>
              <Navbar />
              <main className="flex-1">{children}</main>
              <Footer />
              <MobileTabBar />
            </WishlistProvider>
          </UserProvider>
          <ThemedToaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
