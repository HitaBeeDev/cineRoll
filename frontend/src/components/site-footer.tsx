import { SiteFeedbackForm } from "@/components/site-feedback-form";

export function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-[#07070b]">
      <div className="mx-auto max-w-screen-2xl px-6 py-10 lg:px-10 xl:px-12">
        <section className="grid gap-6 border-b border-white/10 pb-10 lg:grid-cols-[280px_1fr] lg:items-start">
          <div>
            <p className="font-[family-name:var(--font-geist-mono)] text-[10px] font-semibold uppercase tracking-[0.45em] text-[#e8453c]">
              Share Your Thoughts
            </p>
            <p className="mt-3 max-w-sm text-sm leading-6 text-[#8f8fa6]">
              Tell us what feels missing, confusing, or worth building next.
            </p>
          </div>
          <SiteFeedbackForm />
        </section>
        <p className="pt-6 font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-[0.28em] text-[#5f5f78]">
          © {new Date().getFullYear()} CineRoll
        </p>
      </div>
    </footer>
  );
}
