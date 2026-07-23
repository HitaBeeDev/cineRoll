import Link from "next/link";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { AuthButton } from "@/components/auth-button";
import { primaryNavItems } from "@/components/site-navigation/nav-items";
import { isActiveRoute } from "@/components/site-navigation/is-active-route";

/** Full-screen mobile navigation sheet. Rendered into a portal by the parent. */
export function MobileNavMenu({
  pathname,
  focusRingClassName,
  onClose,
}: {
  pathname: string;
  focusRingClassName: string;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[9999] bg-[#050508] text-[#F5F5F0] md:hidden"
      role="dialog"
      aria-modal="true"
      aria-label="Primary navigation"
      onClick={onClose}
    >
      <div
        className="flex h-dvh min-h-0 flex-col overflow-y-auto px-5 py-4"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-[#1c1c2a] pb-4">
          <span className="font-[family-name:var(--font-geist-mono)] text-base font-bold uppercase tracking-[0.15em] text-[#e8453c]">
            Cine·Roll
          </span>
          <button
            type="button"
            className={cn(
              "inline-flex h-10 w-10 items-center justify-center rounded-full",
              "border border-[#222232] text-[#888899]",
              "transition-colors hover:text-[#F5F5F0] focus-visible:outline-none focus-visible:ring-2",
              focusRingClassName,
            )}
            aria-label="Close navigation menu"
            onClick={onClose}
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>

        <nav className="flex min-h-0 flex-1 flex-col gap-6 py-6" aria-label="Mobile navigation">
          <div className="flex flex-col gap-1">
            {primaryNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-xl px-3 py-3 font-[family-name:var(--font-geist-mono)] text-lg font-bold uppercase tracking-[0.16em]",
                  isActiveRoute(pathname, item.href)
                    ? "bg-[#141421] text-[#F5F5F0]"
                    : "text-[#9b96aa] transition-colors hover:bg-[#10101a] hover:text-[#F5F5F0]",
                  "focus-visible:outline-none focus-visible:ring-2",
                  focusRingClassName,
                )}
                onClick={onClose}
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="mt-auto border-t border-[#222232] pt-5">
            <AuthButton
              variant="inline"
              onNavigate={onClose}
              focusRingClassName={focusRingClassName}
            />
          </div>
        </nav>
      </div>
    </div>
  );
}
