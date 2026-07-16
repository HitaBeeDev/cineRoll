import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type PanelProps = { children: ReactNode; className?: string | undefined };

export function Panel({ children, className }: PanelProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-white/10 bg-white/[0.035] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.18)] sm:p-6",
        className,
      )}
    >
      {children}
    </div>
  );
}
