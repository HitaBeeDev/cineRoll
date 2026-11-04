import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PlacePage } from "@/features/places/components/place-page";
import { fetchPlaces } from "@/features/places/fetch-places";
import { PLACE_COPY } from "@/features/places/place-copy";

type Props = { params: Promise<{ slug: string }> };

// Rendered on first visit, then cached for a day — never at build time.
export const revalidate = 86400;
export function generateStaticParams() {
  return [];
}

async function findPlace(params: Props["params"]) {
  const { slug } = await params;
  return (await fetchPlaces("languages")).find((place) => place.slug === slug);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const place = await findPlace(params);
  if (!place) return {};
  const copy = PLACE_COPY.languages;
  return {
    title: copy.title(place.name),
    description: copy.description(place.name),
    alternates: { canonical: `/languages/${place.slug}` },
  };
}

export default async function LanguagePage({ params }: Props) {
  const place = await findPlace(params);
  if (!place) notFound();
  return <PlacePage kind="languages" place={place} />;
}
