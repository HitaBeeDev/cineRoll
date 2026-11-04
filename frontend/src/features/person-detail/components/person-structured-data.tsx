import { JsonLd } from "@/components/json-ld";
import { buildPersonJsonLd } from "@/lib/seo/build-person-json-ld";
import type { PersonProps } from "../component-props";

export function PersonStructuredData({ person }: PersonProps) {
  return <JsonLd data={buildPersonJsonLd(person)} />;
}
