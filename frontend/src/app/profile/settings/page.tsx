import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { BadgeCheck, CalendarDays, KeyRound } from "lucide-react";
import { auth } from "@/auth";
import { AppHeader } from "@/components/app-header";
import { AvatarPicker } from "@/components/settings/avatar-picker";
import { DeleteAccountCard } from "@/components/settings/delete-account-card";
import { PasswordForm } from "@/components/settings/password-form";
import { PrivacyDataCard } from "@/components/settings/privacy-data-card";
import { SectionHeading } from "@/components/settings/section-heading";
import { SETTINGS_CARD } from "@/components/settings/settings-card-class";
import { SignOutButton } from "@/components/sign-out-button";
import { UserAvatar } from "@/components/user-avatar";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Settings",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect(`/auth/signin`);

  const { name, email } = session.user;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      image: true,
      passwordHash: true,
      emailVerified: true,
      createdAt: true,
      accounts: { select: { provider: true } },
    },
  });
  const image = user?.image ?? null;
  const hasPassword = Boolean(user?.passwordHash);
  const usesGoogle = user?.accounts.some((a) => a.provider === "google") ?? false;
  const providerLabel = usesGoogle ? "Google" : "email & password";
  const memberSince = user?.createdAt ? user.createdAt.getFullYear() : null;
  const emailVerified = Boolean(user?.emailVerified);

  return (
    <main className="flex-1 bg-ink-950 text-fg">
      <AppHeader />
      <div className="mx-auto max-w-5xl px-6 py-10 lg:px-10">
        <h1 className="font-[family-name:var(--font-display)] text-4xl font-bold tracking-tight text-fg-hi">
          Settings
        </h1>

        <div className="mt-8 flex flex-col gap-6">
          {/* Account, full width and first. It is what the page is about, and it
              used to be the quietest block on it while an optional "set a
              password" form held the visual centre. Width and position give it
              primacy without another accent-coloured button competing. */}
          <section
            className={`bg-gradient-to-b from-[#101020] to-[#0c0c15] px-6 py-6 ${SETTINGS_CARD}`}
          >
            <SectionHeading eyebrow="Account" />
            <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <UserAvatar
                  image={image}
                  name={name}
                  email={email}
                  size={56}
                  className="transition-transform duration-300 group-hover:scale-[1.04]"
                />
                <div className="min-w-0">
                  <p className="truncate text-base font-semibold text-fg-hi">
                    {name ?? "Your account"}
                  </p>
                  {email && <p className="mt-0.5 truncate text-sm text-fg-dim">{email}</p>}
                  {/* Status row — tiny signals that make the account feel real. */}
                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-fg-muted">
                    <span className="inline-flex items-center gap-1.5">
                      <KeyRound className="h-3.5 w-3.5" aria-hidden />
                      Signed in with {providerLabel}
                    </span>
                    {memberSince && (
                      <span className="inline-flex items-center gap-1.5">
                        <CalendarDays className="h-3.5 w-3.5" aria-hidden />
                        Member since {memberSince}
                      </span>
                    )}
                    {emailVerified && (
                      <span className="inline-flex items-center gap-1.5 text-affirm">
                        <BadgeCheck className="h-3.5 w-3.5" aria-hidden />
                        Email verified
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <SignOutButton />
            </div>
          </section>

          <div className="grid items-stretch gap-6 lg:grid-cols-2">
            <section
              className={`bg-ink-850 px-6 py-6 ${SETTINGS_CARD} hover:border-[#3a2f2c]`}
            >
              <SectionHeading
                title="Avatar"
                aside={
                  <span className="text-[11px] text-fg-muted">Changes save automatically</span>
                }
              />
              <p className="mt-2 text-sm text-fg-muted">
                Pick an avatar. It shows up next to your name across CineRoll.
              </p>
              <div className="mt-5">
                <AvatarPicker
                  initialImage={image}
                  name={name ?? null}
                  email={email ?? null}
                />
              </div>
            </section>

            <PrivacyDataCard />
          </div>

          <section className={`bg-ink-850 px-6 py-6 ${SETTINGS_CARD}`}>
            <SectionHeading title={hasPassword ? "Password" : "Set a password"} />
            <p className="mt-2 text-sm text-fg-muted">
              {hasPassword
                ? "Update the password you use to sign in."
                : "Add a password so you can sign in without Google."}
            </p>
            <PasswordForm hasPassword={hasPassword} />
          </section>

          {/* Last, and full width. Destruction belongs after everything else —
              not beside a primary CTA, halfway up the first screen. */}
          <DeleteAccountCard email={email ?? null} hasPassword={hasPassword} />
        </div>
      </div>
    </main>
  );
}
