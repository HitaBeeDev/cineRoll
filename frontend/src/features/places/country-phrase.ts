// Country names that read with "the" in a sentence, and the long official
// names people don't use ("United States of America").
const PHRASES: Record<string, string> = {
  "United States of America": "the United States",
  "United Kingdom": "the United Kingdom",
  Netherlands: "the Netherlands",
  Philippines: "the Philippines",
  "Czech Republic": "the Czech Republic",
  "Dominican Republic": "the Dominican Republic",
  "Soviet Union": "the Soviet Union",
};

/** How a country name reads after "from": "from the United States". */
export function countryPhrase(name: string): string {
  return PHRASES[name] ?? name;
}
