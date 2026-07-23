import { cn } from "@/lib/utils";

/** Shared field styling for the credentials form inputs and labels. */
export const inputClass = cn(
  "h-12 w-full rounded-xl border border-[#2b2b3d] bg-[#10101d] px-4",
  "text-sm text-[#F5F5F0] placeholder:text-[#777789]",
  "transition-colors focus:border-[#e8453c]/70 focus:outline-none focus:ring-2 focus:ring-[#e8453c]/15",
);

export const labelClass = "text-xs font-medium text-[#b8b8c6]";
