import { cn } from "@/lib/utils/cn";

/** Shared field styling for the credentials form inputs and labels. */
export const inputClass = cn(
  "h-12 w-full rounded-xl border border-[#2b2b3d] bg-[#10101d] px-4",
  "text-sm text-fg-hi placeholder:text-[#777789]",
  "transition-colors focus:border-accent/70 focus:outline-none focus:ring-2 focus:ring-accent/15",
);
