import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AppHeader } from "@/components/app-header";
import { buildPersonMetadata } from "@/features/person-detail/build-person-metadata";
import { AwardHistorySection } from "@/features/person-detail/components/award-history-section";
import { FilmographySection } from "@/features/person-detail/components/filmography-section";
import { PersonHero } from "@/features/person-detail/components/person-hero";
import { PersonStructuredData } from "@/features/person-detail/components/person-structured-data";
import { getAwardBodies } from "@/features/person-detail/get-award-bodies";
type PersonPageProps = { params: Promise<{ slug: string }> };
import { fetchPerson } from "@/features/person-detail/person-repository";
import { getNameHue } from "@/lib/name-avatar";

export async function generateMetadata({
  params,
}: PersonPageProps): Promise<Metadata> {
  const { slug } = await params;
  const person = await fetchPerson(slug);
  return person
    ? buildPersonMetadata(person, slug)
    : { title: "Person Not Found" };
}

export default async function PersonPage({ params }: PersonPageProps) {
  const { slug } = await params;
  const person = await fetchPerson(slug);
  if (!person) notFound();

  return (
    <main className="min-h-screen bg-[#07070b] text-[#f4f4f5]">
      <PersonStructuredData person={person} />
      <AppHeader />
      <PersonHero person={person} avatarHue={getNameHue(person.name)} />

      <div className="relative bg-[#0a0a10]">
        <div
          className="pointer-events-none absolute -top-px left-1/2 h-px w-[80vw] -translate-x-1/2"
          style={{
            background:
              "linear-gradient(to right, transparent, #e8453c22, transparent)",
          }}
        />
        <div className="mx-auto max-w-5xl space-y-20 px-6 py-20 lg:px-10">
          <AwardHistorySection awardBodies={getAwardBodies(person)} />
          <FilmographySection films={person.films} />
        </div>
      </div>
    </main>
  );
}
