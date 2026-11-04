/**
 * A shorter way to say a long category name, for page titles. Golden Globe
 * names are padded ("Best Performance by an Actress in a Motion Picture -
 * Musical or Comedy"); the short form is how people say it ("Best Actress –
 * Musical or Comedy"). Names that are already short come back unchanged.
 */
export function shortCategoryName(name: string): string {
  return name
    .replace(/^Best Performance by an? (Actor|Actress) in a Supporting Role/i, "Best Supporting $1")
    .replace(/^Best Performance by an? (Actor|Actress)/i, "Best $1")
    .replace(/^(Actor|Actress) in a Supporting Role/i, "Best Supporting $1")
    .replace(/^(Actor|Actress) in a Leading Role/i, "Best $1")
    .replace(/Motion Picture Made for Television/gi, "TV Movie")
    .replace(/Television/gi, "TV")
    .replace(/ in (a|any) (Motion Picture|Television Series|Limited Series)/gi, "")
    .replace(/ - Motion Picture$/i, "")
    .replace(/ - /g, " – ")
    .replace(/\s+/g, " ")
    .trim();
}
