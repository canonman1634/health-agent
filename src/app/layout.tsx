import type { Metadata, Viewport } from "next";
import "./globals.css";
import { MobileNav } from "@/components/layout/mobile-nav";

export const metadata: Metadata = {
  title: "Health Agent",
  description: "Your personal health coaching dashboard",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#030712",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans bg-gray-950 text-white">
        <main className="pb-20 min-h-screen">{children}</main>
        <MobileNav />
      </body>
    </html>
  );
}
