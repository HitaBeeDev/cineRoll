import { AppHeader } from "@/components/app-header";

export const metadata = {
  title: "Describe It",
  description: "Describe the kind of film you want and let CineRoll interpret the mood.",
};

export default function DescribePage() {
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#09090f] text-[#F5F5F0]">
      <AppHeader />

      <main className="flex flex-1 flex-col overflow-y-auto px-6 py-8 [scrollbar-width:none] sm:px-10 lg:px-14 [&::-webkit-scrollbar]:w-0">
        <div className="flex max-w-3xl flex-1 flex-col justify-center">
          <p className="mb-2 font-[family-name:var(--font-geist-mono)] text-[9px] uppercase tracking-[0.3em] text-[#e8453c]/70">
            ◈ Natural Language Roll ◈
          </p>
          <h1 className="font-[family-name:var(--font-display)] text-4xl font-bold leading-none tracking-tight text-[#F5F5F0] sm:text-6xl">
            Describe It
          </h1>
          <p className="mt-4 max-w-xl font-[family-name:var(--font-geist-mono)] text-[10px] uppercase leading-6 tracking-widest text-[#66667a]">
            Tell CineRoll what you want in plain English.
          </p>
        </div>
      </main>
    </div>
  );
}
