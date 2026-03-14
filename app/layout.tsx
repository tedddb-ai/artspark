import type { Metadata, Viewport } from "next";
import Link from "next/link";
import Image from "next/image";
import "./globals.css";

export const metadata: Metadata = {
  title: "ArtSpark — Little Bay Arts & Crafts",
  description: "Turn art project inspiration into classroom-ready lesson plans",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Little Bay",
  },
};

export const viewport: Viewport = {
  themeColor: "#C1272D",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="/logo.png" />
      </head>
      <body className="bg-cream antialiased">
        {/* Nav */}
        <header className="sticky top-0 z-50 border-b border-amber-100 bg-cream/90 backdrop-blur">
          <div className="mx-auto flex max-w-lg items-center justify-between px-4 py-2">
            <Link href="/" className="flex items-center gap-2">
              <Image src="/logo.png" alt="Little Bay" width={40} height={40} className="h-10 w-auto rounded-full" />
              <span className="text-lg font-bold text-gray-900" style={{ fontFamily: "marker felt, comic sans ms, cursive" }}>
                ArtSpark
              </span>
            </Link>
            <Link
              href="/library"
              className="rounded-full bg-amber-50 px-3 py-1.5 text-sm font-medium text-amber-800 transition hover:bg-amber-100"
            >
              Library
            </Link>
          </div>
        </header>
        <main className="mx-auto max-w-lg px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
