import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AppHeader } from "@/components/app-header";
import { SignOutButton } from "@/components/sign-out-button";

export const metadata: Metadata = {
  title: "Settings | CineRoll",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user) redirect(`/auth/signin`);

  const { name, email } = session.user;

  return (
    <main className="min-h-screen bg-[#07070b] text-[#f4f4f5]">
      <AppHeader />
      <div className="mx-auto max-w-2xl px-6 py-16 lg:px-10">
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold text-[#F5F5F0]">
          Settings
        </h1>

        <section className="mt-10 rounded-xl border border-[#1e1e2a] bg-[#0d0d1a] px-6 py-7">
          <h2 className="font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-[0.2em] text-[#666677]">
            Account
          </h2>
          <dl className="mt-4 space-y-3">
            {name && (
              <div className="flex justify-between gap-4">
                <dt className="font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-widest text-[#888899]">
                  Name
                </dt>
                <dd className="truncate text-sm text-[#F5F5F0]">{name}</dd>
              </div>
            )}
            {email && (
              <div className="flex justify-between gap-4">
                <dt className="font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-widest text-[#888899]">
                  Email
                </dt>
                <dd className="truncate text-sm text-[#F5F5F0]">{email}</dd>
              </div>
            )}
          </dl>

          <div className="mt-7">
            <SignOutButton />
          </div>
        </section>
      </div>
    </main>
  );
}
