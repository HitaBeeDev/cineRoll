import type { Metadata } from "next";
import { Suspense } from "react";
import { Geist, Geist_Mono, Playfair_Display } from "next/font/google";
import { AnalyticsPageView } from "@/components/analytics-page-view";
import { PageTransition } from "@/components/page-transition";
import { Providers } from "@/components/providers";
import { SiteFooter } from "@/components/site-footer";
import { SiteFooterGate } from "@/components/site-footer-gate";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const playfairDisplay = Playfair_Display({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://cineroll.app");

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "CineRoll",
    template: "%s | CineRoll",
  },
  description: "Discover award-winning films with a roll of the dice.",
  openGraph: {
    siteName: "CineRoll",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      dir="ltr"
      data-theme="dark"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${playfairDisplay.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#09090f] text-[#F5F5F0]">
        <Providers>
          <Suspense fallback={null}>
            <AnalyticsPageView />
          </Suspense>
          <PageTransition>{children}</PageTransition>
          <SiteFooterGate>
            <SiteFooter />
          </SiteFooterGate>
        </Providers>
      </body>
    </html>
  );
}
