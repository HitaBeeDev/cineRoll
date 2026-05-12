import type { Metadata } from "next";
import "../globals.css";

export const metadata: Metadata = {
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

export default function FilmRootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <body className="min-h-full flex flex-col bg-[#09090f] text-[#F5F5F0]">
        {children}
      </body>
    </html>
  );
}
