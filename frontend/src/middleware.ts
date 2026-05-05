import createMiddleware from "next-intl/middleware";

import { defaultLocale, locales } from "@/i18n/request";

export default createMiddleware({
  locales,
  defaultLocale,
  localePrefix: "always",
  localeDetection: true,
});

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
