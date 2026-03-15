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
            <div className="flex items-center gap-2">
              <Link
                href="/homeschool"
                className="rounded-full bg-amber-50 px-3 py-1.5 text-sm font-medium text-amber-800 transition hover:bg-amber-100"
              >
                Homeschool
              </Link>
              <Link
                href="/gallery"
                className="rounded-full bg-amber-50 px-3 py-1.5 text-sm font-medium text-amber-800 transition hover:bg-amber-100"
              >
                Gallery
              </Link>
              <Link
                href="/library"
                className="rounded-full bg-amber-50 px-3 py-1.5 text-sm font-medium text-amber-800 transition hover:bg-amber-100"
              >
                Library
              </Link>
              <Link
                href="/supplies"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-50 text-amber-800 transition hover:bg-amber-100"
                title="My Supplies"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                  <path fillRule="evenodd" d="M7.84 1.804A1 1 0 018.82 1h2.36a1 1 0 01.98.804l.331 1.652a6.993 6.993 0 011.929 1.115l1.598-.54a1 1 0 011.186.447l1.18 2.044a1 1 0 01-.205 1.251l-1.267 1.113a7.047 7.047 0 010 2.228l1.267 1.113a1 1 0 01.206 1.25l-1.18 2.045a1 1 0 01-1.187.447l-1.598-.54a6.993 6.993 0 01-1.929 1.115l-.33 1.652a1 1 0 01-.98.804H8.82a1 1 0 01-.98-.804l-.331-1.652a6.993 6.993 0 01-1.929-1.115l-1.598.54a1 1 0 01-1.186-.447l-1.18-2.044a1 1 0 01.205-1.251l1.267-1.114a7.05 7.05 0 010-2.227L1.821 7.773a1 1 0 01-.206-1.25l1.18-2.045a1 1 0 011.187-.447l1.598.54A6.993 6.993 0 017.51 3.456l.33-1.652zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                </svg>
              </Link>
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-lg px-4 py-6">{children}</main>
        <footer className="mx-auto max-w-lg px-4 pb-6 text-center text-[10px] text-gray-400">
          <p>As an Amazon Associate, ArtSpark earns from qualifying purchases.</p>
        </footer>
      </body>
    </html>
  );
}
