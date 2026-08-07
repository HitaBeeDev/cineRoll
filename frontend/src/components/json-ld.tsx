import { serializeJsonLd } from "@/lib/serialize-json-ld";

// The single place structured data reaches the DOM. Every JSON-LD block goes
// through here so no call site has to remember to escape its payload.
export function JsonLd({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
    />
  );
}
