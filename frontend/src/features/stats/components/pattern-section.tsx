import { Sparkles } from "lucide-react";
import type { StatsViewModel } from "../types";

export function PatternSection({ viewModel }: { viewModel: StatsViewModel }) {
  if (viewModel.conclusionPoints.length === 0) return null;
  return (
    <section className="border-t border-white/10 pt-12">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-12">
        <div>
          <div className="flex items-center gap-2 font-[family-name:var(--font-geist-mono)] text-xs uppercase tracking-[0.22em] text-[#e8453c]"><Sparkles className="h-3.5 w-3.5" />The pattern</div>
          <h2 className="mt-4 font-[family-name:var(--font-display)] text-3xl font-bold leading-[1.1] text-[#f4f0f7] sm:text-[2.75rem]">The archive is not evenly distributed.</h2>
          <p className="mt-4 font-[family-name:var(--font-display)] text-xl leading-relaxed text-[#b6b2c6] sm:text-2xl">{viewModel.conclusionPoints.join(" ")}</p>
        </div>
        {viewModel.insights.length > 0 && <ol className="flex flex-col justify-center divide-y divide-white/10">{viewModel.insights.map((insight, index) => <li key={insight.title} className="flex gap-5 py-4 first:pt-0 last:pb-0"><span className="font-[family-name:var(--font-display)] text-2xl font-bold tabular-nums text-[#4b4658]">{String(index + 1).padStart(2, "0")}</span><div><h3 className="font-[family-name:var(--font-display)] text-lg font-bold leading-tight text-[#f4f0f7]">{insight.title}</h3><p className="mt-1 text-sm leading-6 text-[#b6b2c6]">{insight.body}</p></div></li>)}</ol>}
      </div>
    </section>
  );
}
