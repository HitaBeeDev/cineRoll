import { JsonLd } from "@/components/json-ld";
import { buildPersonJsonLd } from "../build-person-json-ld";
import type { PersonProps } from "../component-props";

export function PersonStructuredData({ person }: PersonProps) {
  return <JsonLd data={buildPersonJsonLd(person)} />;
}
