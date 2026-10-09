import type { Metadata } from "next";
import { Toaster } from "sonner";

import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { UserProvider } from "@/context/UserContext";
import { APP_NAME } from "@/lib/config";

import "./globals.css";

export const metadata: Metadata = {
  title: `${APP_NAME} | Holiday rentals, cabins, beach houses & more`,
  description: "Find homes, cabins and villas for your next trip.",
};

// The root layout wraps every page: navbar on top, page content, footer at the bottom
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col antialiased">
        <UserProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </UserProvider>
        <Toaster
          position="bottom-left"
          toastOptions={{ className: "!rounded-xl !text-sm !font-semibold" }}
        />
      </body>
    </html>
  );
}
