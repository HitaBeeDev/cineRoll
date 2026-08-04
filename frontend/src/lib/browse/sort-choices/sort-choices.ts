import type { SortChoice } from "./sort-choice";
import { choice } from "./choice";

export const SORT_CHOICES: SortChoice[] = [
  choice("relevance", "desc", "Relevance", true),
  choice("wins",      "desc", "Most wins"),
  choice("noms",      "desc", "Most nominations"),
  choice("newest",    "desc", "Newest first"),
  choice("newest",    "asc",  "Oldest first"),
  // Named by what they rank, not by where the number came from: "IMDb" and "RT"
  // are sources, and a list of sources beside a list of orderings reads as two
  // different kinds of answer to the same question.
  choice("rating",    "desc", "Highest IMDb rating"),
  choice("rt",        "desc", "Highest RT score"),
  choice("title",     "asc",  "Title (A–Z)"),
  choice("title",     "desc", "Title (Z–A)"),
];
