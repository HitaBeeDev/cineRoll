import type { Metadata } from "next";
import { AppHeader } from "@/components/app-header";

export const metadata: Metadata = {
  title: "Privacy Policy | CineRoll",
  description:
    "CineRoll privacy policy covering account data, film activity, comments, analytics, service providers, retention, and deletion.",
};

const updatedAt = "June 19, 2026";

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#08080d] text-[#f4f4f5]">
      <AppHeader />
      <section className="border-b border-white/10 bg-[#0b0b12]">
        <div className="mx-auto max-w-4xl px-6 py-16 lg:px-10">
          <p className="font-[family-name:var(--font-geist-mono)] text-[10px] font-semibold uppercase tracking-[0.45em] text-[#e8453c]">
            Legal
          </p>
          <h1 className="mt-5 font-[family-name:var(--font-display)] text-4xl font-bold tracking-tight text-[#f8f8f4] sm:text-5xl">
            Privacy Policy
          </h1>
          <p className="mt-4 text-sm leading-7 text-[#a8a8bd]">
            Last updated: {updatedAt}
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-4xl space-y-10 px-6 py-14 text-[#c8c8d8] lg:px-10">
        <PolicySection title="Overview">
          <p>
            CineRoll helps people discover and track films. This policy explains
            what data we collect, why we collect it, how long we keep it, which
            service providers process it, and how you can request deletion.
          </p>
        </PolicySection>

        <PolicySection title="Data We Collect">
          <ul>
            <li>
              Account data: email address, display name, avatar, sign-in
              provider identifiers, session records, and email verification
              status.
            </li>
            <li>
              Film activity: watch history, watchlist entries, hidden or
              not-interested films, taste preferences, recommendations, and
              roll activity.
            </li>
            <li>
              Ratings and comments: film ratings, liked or disliked watched
              films, public film comments, comment timestamps, and moderation
              state.
            </li>
            <li>
              Analytics events: impressions, clicks, searches, filter usage,
              recommendation interactions, pick-of-day interactions, anonymous
              browser IDs, session IDs, and related non-sensitive context.
            </li>
            <li>
              Feedback submissions: optional email address, message body,
              timestamp, and anti-abuse signals from the submission request.
            </li>
          </ul>
        </PolicySection>

        <PolicySection title="Why We Use Data">
          <ul>
            <li>To create and secure your account and sign-in sessions.</li>
            <li>To save watch history, watchlists, ratings, and comments.</li>
            <li>
              To personalize recommendations and taste-weighted rolls from your
              saved film activity.
            </li>
            <li>
              To understand whether CineRoll features work well and where the
              product needs improvement.
            </li>
            <li>To respond to feedback and prevent spam or abuse.</li>
          </ul>
        </PolicySection>

        <PolicySection title="Retention">
          <ul>
            <li>
              Account, watch history, watchlist, ratings, comments, and taste
              profile data are kept while your account remains active.
            </li>
            <li>
              Analytics events are retained for product analysis and may be
              aggregated for longer-term trend reporting.
            </li>
            <li>
              Feedback submissions are retained while they are useful for
              product planning, support, and abuse prevention.
            </li>
            <li>
              If you request account deletion, we delete or anonymize personal
              account data unless retention is required for security, legal, or
              abuse-prevention reasons.
            </li>
          </ul>
        </PolicySection>

        <PolicySection title="Processors">
          <p>CineRoll relies on these service providers to operate the app:</p>
          <ul>
            <li>Neon for hosted PostgreSQL database storage.</li>
            <li>Railway for backend hosting and runtime infrastructure.</li>
            <li>Vercel for frontend hosting and serverless routes.</li>
            <li>Resend for sign-in and feedback notification emails.</li>
            <li>
              TMDB and OMDB for film metadata enrichment and poster or movie
              reference data.
            </li>
          </ul>
        </PolicySection>

        <PolicySection title="Public Content">
          <p>
            Film comments are public by default and may show your display name,
            avatar, date, and comment body. Comments may be hidden or removed if
            needed for moderation, abuse prevention, or legal reasons.
          </p>
        </PolicySection>

        <PolicySection title="Deletion Process">
          <p>
            To request deletion of your account data, email the site owner from
            the email address associated with your CineRoll account, or send a
            request through the feedback form with the same account email. We
            may ask you to verify account ownership before deleting data.
          </p>
          <p>
            Deletion requests cover account profile data, watch history,
            watchlists, ratings, comments, and related taste profile data.
            Aggregated analytics that no longer identify you may be retained.
          </p>
        </PolicySection>

        <PolicySection title="Contact">
          <p>
            For privacy questions or deletion requests, use the feedback form at
            the bottom of this page and include the email address connected to
            your account.
          </p>
        </PolicySection>
      </div>
    </main>
  );
}

function PolicySection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4">
      <h2 className="font-[family-name:var(--font-geist-mono)] text-[11px] font-semibold uppercase tracking-[0.4em] text-[#e8453c]">
        {title}
      </h2>
      <div className="space-y-4 text-sm leading-7 text-[#c8c8d8] [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5">
        {children}
      </div>
    </section>
  );
}
