import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { BadgeCheck, CalendarDays, KeyRound } from "lucide-react";
import { auth } from "@/auth";
import { AppHeader } from "@/components/app-header";
import { AvatarPicker } from "@/components/settings/avatar-picker";
import { PasswordDisclosure } from "@/components/settings/password-disclosure";
import { SignOutButton } from "@/components/sign-out-button";
import { UserAvatar } from "@/components/user-avatar";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Settings",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

// Shared card shell — subtle, and it comes alive on hover (lifts a hair, border
// warms, a soft shadow appears) so the page feels responsive rather than static.
const CARD =
  "group rounded-2xl border border-[#1b1b26] transition-all duration-300 ease-out " +
  "hover:-translate-y-px hover:border-[#2b2b3d] hover:shadow-[0_16px_44px_-28px_rgba(0,0,0,0.9)]";

const KICKER =
  "font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.2em] text-[#7a7a8c]";

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
    <main className="min-h-screen bg-[#07070b] text-[#f4f4f5]">
      <AppHeader />
      <div className="mx-auto max-w-2xl px-6 py-16 lg:px-10">
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold text-[#F5F5F0]">
          Settings
        </h1>

        {/* Account — a compact profile summary */}
        <section
          className={`mt-10 bg-gradient-to-b from-[#101020] to-[#0c0c15] px-6 py-5 ${CARD}`}
        >
          <h2 className={KICKER}>Account</h2>
          <div className="mt-4 flex items-center gap-4">
            <UserAvatar
              image={image}
              name={name}
              email={email}
              size={56}
              className="transition-transform duration-300 group-hover:scale-[1.04]"
            />
            <div className="min-w-0">
              {name && (
                <p className="truncate text-base font-semibold text-[#F5F5F0]">{name}</p>
              )}
              {email && <p className="truncate text-sm text-[#888899]">{email}</p>}
            </div>
          </div>

          {/* Status row — tiny signals that make the account feel real. */}
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-[#7f7f92]">
            <span className="inline-flex items-center gap-1.5">
              <KeyRound className="h-3.5 w-3.5 text-[#6f6f82]" aria-hidden />
              Signed in with {providerLabel}
            </span>
            {memberSince && (
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays className="h-3.5 w-3.5 text-[#6f6f82]" aria-hidden />
                Member since {memberSince}
              </span>
            )}
            {emailVerified && (
              <span className="inline-flex items-center gap-1.5 text-[#5fbf72]">
                <BadgeCheck className="h-3.5 w-3.5" aria-hidden />
                Email verified
              </span>
            )}
          </div>

          <div className="mt-5">
            <SignOutButton />
          </div>
        </section>

        {/* Avatar — the playful one */}
        <section className={`mt-6 bg-[#0d0d16] px-6 py-6 ${CARD} hover:border-[#3a2f2c]`}>
          <div className="flex items-baseline justify-between gap-3">
            <h2 className={KICKER}>Avatar</h2>
            <span className="text-[11px] text-[#5a5a6c]">tap to change</span>
          </div>
          <p className="mt-2 text-sm text-[#888899]">
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

        {/* Password — the form, tucked away until needed */}
        <section className={`mt-6 bg-[#0d0d16] px-6 py-6 ${CARD}`}>
          <h2 className={KICKER}>{hasPassword ? "Password" : "Set a password"}</h2>
          <p className="mt-2 text-sm text-[#888899]">
            {hasPassword
              ? "Update the password you use to sign in."
              : "Add a password so you can sign in without Google."}
          </p>
          <PasswordDisclosure hasPassword={hasPassword} />
        </section>
      </div>
    </main>
  );
}
