const structuredData = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Award Film Stats & Records | CineRoll",
  description: "Statistics about Oscar, Golden Globe, Cannes, and Berlinale-nominated and winning films.",
  url: "https://cineroll.app/stats",
  mainEntity: {
    "@type": "Dataset",
    name: "CineRoll Award Film Statistics",
    description: "Statistics about Oscar, Golden Globe, Cannes, and Berlinale-nominated and winning films.",
  },
};

export function StatsStructuredData() {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />;
}
