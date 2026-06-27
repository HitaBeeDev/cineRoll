import Link from "next/link";

/** Shared dark chrome for the auth sub-pages (forgot/reset password) so they
 *  match the sign-in page without duplicating the gradient + header markup. */
export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex h-dvh flex-col overflow-hidden bg-[#09090f] text-[#F5F5F0]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_40%,rgba(232,69,60,0.12),transparent_40%)]" />

      <header className="relative z-10 flex h-16 shrink-0 items-center px-6">
        <Link
          href="/"
          className="font-[family-name:var(--font-geist-mono)] text-base font-bold uppercase tracking-[0.16em] text-[#e8453c] transition-colors hover:text-[#ff7068]"
        >
          Cine·Roll
        </Link>
      </header>

      <main className="relative z-10 flex min-h-0 flex-1 items-center justify-center overflow-hidden px-4 py-6 sm:py-10">
        <div className="w-full min-w-0 max-w-sm">
          <section className="min-w-0 overflow-hidden rounded-2xl border border-white/10 bg-[#0d0d16]/72 p-5 shadow-[0_24px_90px_rgba(0,0,0,0.36)] backdrop-blur sm:p-7">
            {children}
          </section>
        </div>
      </main>
    </div>
  );
}
