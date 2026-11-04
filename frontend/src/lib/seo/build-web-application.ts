import { absoluteUrl } from "./absolute-url";

/** schema.org WebApplication for a free in-browser tool page. */
export function buildWebApplication({ name, path, description }: { name: string; path: string; description: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name,
    url: absoluteUrl(path),
    description,
    applicationCategory: "EntertainmentApplication",
    operatingSystem: "Any",
    isAccessibleForFree: true,
    offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
  };
}
