"use client";

import { useTransition } from "react";
import { useLocale } from "next-intl";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Globe } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  defaultLocale,
  isSupportedLocale,
  locales,
  type Locale,
} from "@/i18n/request";
import { cn } from "@/lib/utils";

const localeNames: Record<Locale, string> = {
  en: "English",
  es: "Español",
  fr: "Français",
  de: "Deutsch",
  fa: "فارسی",
  ja: "日本語",
  pt: "Português",
};

const localeCookieMaxAge = 60 * 60 * 24 * 365;

export function LanguageSwitcher({ className }: { className?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeLocale = useLocale();
  const [isPending, startTransition] = useTransition();
  const currentLocale = isSupportedLocale(activeLocale)
    ? activeLocale
    : defaultLocale;

  function handleLocaleChange(nextLocale: string) {
    if (!isSupportedLocale(nextLocale) || nextLocale === currentLocale) return;

    document.cookie = [
      `NEXT_LOCALE=${nextLocale}`,
      "Path=/",
      `Max-Age=${localeCookieMaxAge}`,
      "SameSite=Lax",
    ].join("; ");

    const nextPathname = getLocalizedPathname(
      pathname,
      nextLocale,
      currentLocale,
    );
    const query = searchParams.toString();
    const nextUrl = query ? `${nextPathname}?${query}` : nextPathname;

    startTransition(() => {
      router.replace(nextUrl);
    });
  }

  return (
    <Select
      value={currentLocale}
      onValueChange={handleLocaleChange}
      disabled={isPending}
    >
      <SelectTrigger
        aria-label="Language"
        className={cn("h-9 w-[9.5rem] gap-2", className)}
      >
        <Globe className="h-4 w-4 shrink-0 text-zinc-500" aria-hidden />
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {locales.map((locale) => (
          <SelectItem key={locale} value={locale}>
            {localeNames[locale]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function getLocalizedPathname(
  pathname: string,
  nextLocale: Locale,
  currentLocale: Locale,
) {
  if (pathname === `/${currentLocale}`) return `/${nextLocale}`;
  if (pathname.startsWith(`/${currentLocale}/`)) {
    return `/${nextLocale}${pathname.slice(currentLocale.length + 1)}`;
  }

  const firstSegment = pathname.split("/")[1];
  if (isSupportedLocale(firstSegment)) {
    return pathname.replace(`/${firstSegment}`, `/${nextLocale}`);
  }

  return `/${nextLocale}${pathname === "/" ? "" : pathname}`;
}
