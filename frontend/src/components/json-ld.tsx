import { serializeJsonLd } from "@/lib/serialize-json-ld";

// The only place hidden search-engine data gets written to the page. Use this
// for every new block, so no one has to remember to make the text safe first.
export function JsonLd({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
    />
  );
}
