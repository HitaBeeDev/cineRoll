import * as React from "react";
import { cn } from "@/lib/utils/cn";

export const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-lg border border-border bg-surface text-foreground",
      "shadow-sm transition-colors duration-200",
      className
    )}
    {...props}
  />
));
Card.displayName = "Card";
