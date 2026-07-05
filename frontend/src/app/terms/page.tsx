import type { Metadata } from "next";
import { AppHeader } from "@/components/app-header";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "CineRoll terms of service covering acceptable use, accounts, user content ownership, moderation and removal rights, third-party film data, and disclaimers.",
};

const updatedAt = "July 4, 2026";

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#08080d] text-[#f4f4f5]">
      <AppHeader />
      <section className="border-b border-white/10 bg-[#0b0b12]">
        <div className="mx-auto max-w-4xl px-6 py-16 lg:px-10">
          <p className="font-[family-name:var(--font-geist-mono)] text-[11px] font-semibold uppercase tracking-[0.45em] text-[#e8453c]">
            Legal
          </p>
          <h1 className="mt-5 font-[family-name:var(--font-display)] text-4xl font-bold tracking-tight text-[#f8f8f4] sm:text-5xl">
            Terms of Service
          </h1>
          <p className="mt-4 text-sm leading-7 text-[#a8a8bd]">
            Last updated: {updatedAt}
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-4xl space-y-10 px-6 py-14 text-[#c8c8d8] lg:px-10">
        <PolicySection title="Overview">
          <p>
            CineRoll is a film discovery and tracking app. By creating an
            account or using the app, you agree to these terms. If you do not
            agree, please do not use CineRoll.
          </p>
        </PolicySection>

        <PolicySection title="Acceptable Use">
          <p>When using CineRoll, you agree not to:</p>
          <ul>
            <li>
              Post comments or feedback that are unlawful, harassing, hateful,
              threatening, spam, or infringe someone else&apos;s rights.
            </li>
            <li>
              Impersonate another person or misrepresent your affiliation with
              any person or organization.
            </li>
            <li>
              Attempt to disrupt, overload, scrape at scale, reverse-engineer,
              or gain unauthorized access to the service or its data.
            </li>
            <li>
              Use the app to violate any applicable law or the rights of
              others.
            </li>
          </ul>
        </PolicySection>

        <PolicySection title="Accounts">
          <ul>
            <li>
              You are responsible for activity under your account and for
              keeping your sign-in access secure.
            </li>
            <li>
              You must provide accurate information and be permitted to use the
              sign-in provider you connect.
            </li>
            <li>
              We may suspend or terminate accounts that violate these terms or
              are used for abuse.
            </li>
          </ul>
        </PolicySection>

        <PolicySection title="Your Content and Ownership">
          <p>
            You retain ownership of the content you create on CineRoll, such as
            comments, ratings, and feedback. You are responsible for the content
            you post and confirm you have the right to post it.
          </p>
          <p>
            By posting content, you grant CineRoll a non-exclusive, worldwide,
            royalty-free license to host, store, display, and distribute that
            content within the app for the purpose of operating and improving
            the service. Public comments may show your display name, avatar,
            date, and comment body. This license ends when you delete the
            content or your account, except for content already shared publicly
            or retained as required for security, legal, or abuse-prevention
            reasons.
          </p>
        </PolicySection>

        <PolicySection title="Moderation and Removal">
          <p>
            We may review, hide, edit, or remove any content, and suspend or
            terminate access, at our discretion and without prior notice, when
            content is abusive, unlawful, spam, or otherwise violates these
            terms, or when removal is needed to protect users or the service.
          </p>
          <p>
            Comments may be hidden automatically after multiple abuse reports
            and removed following moderation review.
          </p>
        </PolicySection>

        <PolicySection title="Film Data and Third-Party Trademarks">
          <p>
            CineRoll is an independent project and is <strong>not affiliated
            with, endorsed by, or sponsored by</strong> TMDB, OMDB, IMDb, Rotten
            Tomatoes, the Academy of Motion Picture Arts and Sciences (the
            Oscars), the Hollywood Foreign Press Association (the Golden Globes),
            the Festival de Cannes, the Berlin International Film Festival, or
            any studio, distributor, or awarding body.
          </p>
          <p>
            Film metadata, posters, and reference data are provided by
            third-party sources including TMDB and OMDB and remain the property
            of their respective owners. All film titles, awards, logos, and
            related trademarks belong to their respective holders and are used
            for identification and reference only.
          </p>
        </PolicySection>

        <PolicySection title="Disclaimer and Liability">
          <p>
            CineRoll is provided &quot;as is&quot; and &quot;as available&quot;
            without warranties of any kind. We do not guarantee that film data,
            ratings, or recommendations are accurate, complete, or
            uninterrupted. To the maximum extent permitted by law, CineRoll is
            not liable for any indirect, incidental, or consequential damages
            arising from your use of the service.
          </p>
        </PolicySection>

        <PolicySection title="Changes to These Terms">
          <p>
            We may update these terms as the app evolves. Continued use of
            CineRoll after changes take effect means you accept the updated
            terms. The date at the top reflects the latest revision.
          </p>
        </PolicySection>

        <PolicySection title="Contact">
          <p>
            For questions about these terms, use the feedback form at the bottom
            of the page and include the email address connected to your account.
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
