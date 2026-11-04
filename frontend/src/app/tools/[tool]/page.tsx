import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ToolPage } from "@/features/tools/components/tool-page";
import { fetchToolExamples } from "@/features/tools/fetch-tool-examples";
import { TOOLS } from "@/features/tools/tools";

type ToolRouteProps = { params: Promise<{ tool: string }> };

// Regenerated at most daily, for the example films and pool size.
export const revalidate = 86400;
// Only the defined tools exist; anything else is a real 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return TOOLS.map((tool) => ({ tool: tool.slug }));
}

export async function generateMetadata({ params }: ToolRouteProps): Promise<Metadata> {
  const { tool: slug } = await params;
  const tool = TOOLS.find((entry) => entry.slug === slug);
  if (!tool) return {};

  const path = `/tools/${tool.slug}`;
  return {
    title: tool.title,
    description: tool.description,
    alternates: { canonical: path },
    openGraph: { title: tool.h1, description: tool.description, url: path, type: "website" },
  };
}

export default async function ToolRoute({ params }: ToolRouteProps) {
  const { tool: slug } = await params;
  const tool = TOOLS.find((entry) => entry.slug === slug);
  if (!tool) notFound();

  const { films, total } = await fetchToolExamples(tool);
  return <ToolPage tool={tool} examples={films} total={total} />;
}
