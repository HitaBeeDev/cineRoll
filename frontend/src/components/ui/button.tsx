"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md" | "lg";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  asChild?: boolean;
}

const variants: Record<Variant, string> = {
  primary: cn(
    "bg-accent text-accent-foreground font-semibold",
    "hover:brightness-110",
    "active:brightness-95 active:scale-[0.97]",
    "disabled:bg-surface-muted disabled:text-muted"
  ),
  secondary: cn(
    "border border-border text-foreground bg-transparent",
    "hover:border-muted hover:bg-surface-muted/60",
    "active:bg-surface-muted active:scale-[0.97]",
    "disabled:border-surface-muted disabled:text-muted"
  ),
  ghost: cn(
    "text-muted bg-transparent",
    "hover:text-foreground hover:bg-surface-muted/60",
    "active:bg-surface-muted active:scale-[0.97]",
    "disabled:text-muted/60"
  ),
};

const sizes: Record<Size, string> = {
  sm: "h-8 px-3 text-xs rounded-md gap-1.5 tracking-wide uppercase",
  md: "h-10 px-5 text-sm rounded-lg gap-2",
  lg: "h-12 px-7 text-base rounded-lg gap-2.5",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      asChild = false,
      className,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center font-medium",
          "transition-all duration-150 cursor-pointer select-none whitespace-nowrap",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
          "focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          "disabled:pointer-events-none",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";
