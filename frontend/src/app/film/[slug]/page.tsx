import { redirect } from "next/navigation";

import { defaultLocale } from "@/i18n/request";

export default async function FilmRedirectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  redirect(`/${defaultLocale}/film/${encodeURIComponent(slug)}`);
}
