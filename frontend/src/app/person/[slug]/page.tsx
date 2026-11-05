import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { AppHeader } from "@/components/app-header";
import { buildPersonMetadata } from "@/features/person-detail/build-person-metadata";
import { AwardHistorySection } from "@/features/person-detail/components/award-history-section";
import { FilmographySection } from "@/features/person-detail/components/filmography-section";
import { Breadcrumbs } from "@/components/breadcrumbs/breadcrumbs";
import { PersonHero } from "@/features/person-detail/components/person-hero";
import { PersonStructuredData } from "@/features/person-detail/components/person-structured-data";
import { getAwardBodies } from "@/features/person-detail/get-award-bodies";
type PersonPageProps = { params: Promise<{ slug: string }> };
import { fetchPerson } from "@/features/person-detail/person-repository";
import { getNameHue } from "@/lib/name-avatar/get-name-hue";

// 90 days — must be a literal; mirrors PERSON_REVALIDATE_SECONDS.
export const revalidate = 7776000;

// Rendered on first visit, then cached. Without it Next renders a [slug] route
// per request and ignores `revalidate` (see the film page).
export function generateStaticParams() {
  return [];
}

export async function generateMetadata({
  params,
}: PersonPageProps): Promise<Metadata> {
  const { slug } = await params;
  const lookup = await fetchPerson(slug);
  // Redirect here, not only in the page: metadata resolves before anything
  // streams, so this is a real 308 rather than a client-side meta refresh.
  if (lookup && "movedTo" in lookup) permanentRedirect(`/person/${lookup.movedTo}`);
  return lookup
    ? buildPersonMetadata(lookup.person, slug)
    : { title: "Person Not Found" };
}

export default async function PersonPage({ params }: PersonPageProps) {
  const { slug } = await params;
  const lookup = await fetchPerson(slug);
  if (!lookup) notFound();
  if ("movedTo" in lookup) permanentRedirect(`/person/${lookup.movedTo}`);
  const { person } = lookup;

  return (
    <main className="min-h-screen bg-[#07070b] text-[#f4f4f5]">
      <PersonStructuredData person={person} />
      <AppHeader />
      <div className="mx-auto max-w-5xl px-6 pt-5 lg:px-10">
        <Breadcrumbs
          crumbs={[
            { label: "Browse", href: "/browse" },
            { label: person.name, href: `/person/${person.slug}` },
          ]}
        />
      </div>
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
