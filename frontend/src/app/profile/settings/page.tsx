import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AppHeader } from "@/components/app-header";
import { AvatarPicker } from "@/components/settings/avatar-picker";
import { PasswordForm } from "@/components/settings/password-form";
import { SignOutButton } from "@/components/sign-out-button";
import { UserAvatar } from "@/components/user-avatar";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Settings | CineRoll",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect(`/auth/signin`);

  const { name, email } = session.user;

  // Read the persisted avatar + whether a password is set (OAuth-only accounts
  // have no hash, so they "set" rather than "change" a password).
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { image: true, passwordHash: true },
  });
  const image = user?.image ?? null;
  const hasPassword = Boolean(user?.passwordHash);

  return (
    <main className="min-h-screen bg-[#07070b] text-[#f4f4f5]">
      <AppHeader />
      <div className="mx-auto max-w-2xl px-6 py-16 lg:px-10">
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold text-[#F5F5F0]">
          Settings
        </h1>

        {/* Account */}
        <section className="mt-10 rounded-xl border border-[#1e1e2a] bg-[#0d0d1a] px-6 py-7">
          <h2 className="font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.2em] text-[#7a7a8c]">
            Account
          </h2>
          <div className="mt-5 flex items-center gap-4">
            <UserAvatar image={image} name={name} email={email} size={56} />
            <div className="min-w-0">
              {name && (
                <p className="truncate text-base font-semibold text-[#F5F5F0]">
                  {name}
                </p>
              )}
              {email && (
                <p className="truncate text-sm text-[#888899]">{email}</p>
              )}
            </div>
          </div>

          <div className="mt-7">
            <SignOutButton />
          </div>
        </section>

        {/* Avatar */}
        <section className="mt-6 rounded-xl border border-[#1e1e2a] bg-[#0d0d1a] px-6 py-7">
          <h2 className="font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.2em] text-[#7a7a8c]">
            Avatar
          </h2>
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

        {/* Password */}
        <section className="mt-6 rounded-xl border border-[#1e1e2a] bg-[#0d0d1a] px-6 py-7">
          <h2 className="font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.2em] text-[#7a7a8c]">
            {hasPassword ? "Change password" : "Set a password"}
          </h2>
          <p className="mt-2 text-sm text-[#888899]">
            {hasPassword
              ? "Update the password you use to sign in."
              : "Add a password so you can sign in without Google."}
          </p>
          <PasswordForm hasPassword={hasPassword} />
        </section>
      </div>
    </main>
  );
}
