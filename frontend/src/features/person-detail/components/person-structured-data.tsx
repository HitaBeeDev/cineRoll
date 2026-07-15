import { buildPersonJsonLd } from "../build-person-json-ld";
import type { PersonProps } from "../component-props";

export function PersonStructuredData({ person }: PersonProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(buildPersonJsonLd(person)),
      }}
    />
  );
}
