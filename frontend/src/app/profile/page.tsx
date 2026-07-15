import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { auth } from "@/auth";
import { AppHeader } from "@/components/app-header";
import { CompletionistTracker } from "@/features/completionist/components/completionist-tracker";
import { NewUserCallout } from "@/features/profile-dashboard/components/new-user-callout";
import { ProfileIdentity } from "@/features/profile-dashboard/components/profile-identity";
import { ProfileNavigation } from "@/features/profile-dashboard/components/profile-navigation";
import { ProfileRecommendations } from "@/features/profile-dashboard/components/profile-recommendations";
import { ProfileStats } from "@/features/profile-dashboard/components/profile-stats";
import { RecommendationsSkeleton } from "@/features/profile-dashboard/components/recommendations-skeleton";
import { isNewProfile } from "@/features/profile-dashboard/is-new-profile";
import {
  fetchCompletionProgress,
  fetchProfileSummary,
  fetchRecommendations,
} from "@/features/profile-dashboard/profile-repository";

export const metadata: Metadata = {
  title: "Your Profile",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");

  const recommendationsPromise = fetchRecommendations();
  const [summary, progress] = await Promise.all([
    fetchProfileSummary(),
    fetchCompletionProgress(),
  ]);

  return (
    <main className="flex flex-1 flex-col bg-[#07070b] text-[#f4f4f5]">
      <AppHeader />
      <div className="mx-auto max-w-5xl px-6 py-16 lg:px-10">
        <ProfileIdentity
          name={session.user.name}
          email={session.user.email}
        />
        <ProfileStats summary={summary} />
        {isNewProfile(summary) && <NewUserCallout />}
        <ProfileNavigation />
        <CompletionistTracker progress={progress} />
        <Suspense fallback={<RecommendationsSkeleton />}>
          <ProfileRecommendations
            recommendationsPromise={recommendationsPromise}
          />
        </Suspense>
      </div>
    </main>
  );
}
