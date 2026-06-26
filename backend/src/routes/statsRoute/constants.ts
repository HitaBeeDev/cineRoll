// Nominee strings that denote an entity (category descriptor, studio, or
// production company) rather than an individual person. Best Picture / Short
// Subject / Sound categories historically credited the studio in the nominee
// field, so the bare studio names are listed explicitly; suffix tokens like
// "Pictures"/"Productions" are already covered by the descriptor group.
export const NON_PERSON_NOMINEE_PATTERN =
  "(award|prize|honou?rary|special|achievement|jury|committee|ensemble|cast|crew" +
  "|film|picture|series|program|episode|song|score|screenplay|production|cinematography" +
  "|editing|effects|sound|makeup|costume" +
  "|studios?|entertainment|warner bros|metro-goldwyn-mayer|walt disney|paramount|rko" +
  "|20th century|twentieth century|samuel goldwyn|selznick)";

// Categories whose nominee field holds a submitting country, not a person
// (e.g. Best Foreign Language Film / Best International Feature Film).
export const NON_PERSON_CATEGORY_PATTERN = "(foreign language|international feature)";

export const PERSON_ROLE_SUFFIX_PATTERN =
  ",\\s*(producer|director|composer|writer|screenwriter|lyricist|performer|actor|actress)$";
