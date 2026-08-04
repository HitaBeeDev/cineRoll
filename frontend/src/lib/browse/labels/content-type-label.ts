import { CONTENT_TYPE_OPTIONS } from "@/lib/browse/options/content-type-options";

export function contentTypeLabel(value: string): string {
  return CONTENT_TYPE_OPTIONS.find((o) => o.value === value)?.label ?? value;
}
