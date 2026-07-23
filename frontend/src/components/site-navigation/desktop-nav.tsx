import Link from "next/link";
import { cn } from "@/lib/utils";
import { AuthButton } from "@/components/auth-button";
import { primaryNavItems } from "@/components/site-navigation/nav-items";
import { isActiveRoute } from "@/components/site-navigation/is-active-route";

/** Desktop navigation row: primary links and the account button. */
export function DesktopNav({
  pathname,
  focusRingClassName,
}: {
  pathname: string;
  focusRingClassName: string;
}) {
  return (
    <nav
      className="hidden flex-1 items-center justify-end gap-4 md:flex"
      aria-label="Primary navigation"
    >
      <div className="flex items-center gap-1">
        {primaryNavItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "px-3.5 py-2",
              "font-[family-name:var(--font-geist-mono)] text-[12px] uppercase tracking-[0.1em]",
              "transition-colors duration-150",
              "focus-visible:outline-none focus-visible:ring-2",
              focusRingClassName,
              isActiveRoute(pathname, item.href)
                ? "text-[#ff554c]"
                : "text-[#aaa6ba] hover:text-[#F5F5F0]",
            )}
          >
            {item.label}
          </Link>
        ))}
      </div>

      <AuthButton focusRingClassName={focusRingClassName} />
    </nav>
  );
}
