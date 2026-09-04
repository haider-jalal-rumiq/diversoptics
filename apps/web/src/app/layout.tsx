import type { Metadata, Viewport } from "next";
import { Instrument_Serif, Manrope } from "next/font/google";

import {
  getSiteUrl,
  isSearchIndexingEnabled,
  siteConfig,
} from "@/lib/config/site";

import "./globals.css";

const manrope = Manrope({
  display: "swap",
  subsets: ["latin"],
  variable: "--font-manrope",
});

const instrumentSerif = Instrument_Serif({
  display: "swap",
  subsets: ["latin"],
  variable: "--font-instrument-serif",
  weight: "400",
});

const indexable = isSearchIndexingEnabled();

export const metadata: Metadata = {
  description: siteConfig.description,
  icons: {
    icon: "/brand/current-logo.png",
  },
  // Set so route-level canonical and Open Graph paths can stay relative.
  metadataBase: new URL(getSiteUrl()),
  openGraph: {
    locale: "en_PK",
    siteName: siteConfig.name,
    type: "website",
  },
  /**
   * Crawling stays disabled until the Phase 05 launch gate. Real inventory,
   * confirmed policies and verified store facts must land before this site is
   * indexable, so the block is deliberate rather than an oversight. Individual
   * routes such as /search stay noindex even after the gate opens.
   */
  robots: {
    follow: indexable,
    index: indexable,
  },
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
};

export const viewport: Viewport = {
  colorScheme: "light",
  initialScale: 1,
  themeColor: "#151515",
  width: "device-width",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${manrope.variable} ${instrumentSerif.variable}`}
    >
      <body>
        <a
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-semibold"
          href="#main"
        >
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
