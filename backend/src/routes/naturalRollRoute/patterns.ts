export const LOCAL_GENRE_PATTERNS: Array<[RegExp, string]> = [
  [/\b(sci[-\s]?fi|science fiction|space)\b/i, "Science Fiction"],
  [/\b(horror|scary|frightening)\b/i, "Horror"],
  [/\b(thriller|suspense)\b/i, "Thriller"],
  [/\b(comedy|funny|comedie|comedic)\b/i, "Comedy"],
  [/\b(romance|romantic|love story)\b/i, "Romance"],
  [/\b(action)\b/i, "Action"],
  [/\b(documentary|doc)\b/i, "Documentary"],
  [/\b(animation|animated|anime)\b/i, "Animation"],
  [/\b(crime|gangster|noir)\b/i, "Crime"],
  [/\b(history|historical|period piece)\b/i, "History"],
  [/\b(war)\b/i, "War"],
  [/\b(western)\b/i, "Western"],
  [/\b(music|musical)\b/i, "Music"],
  [/\b(biography|biopic)\b/i, "Biography"],
  [/\b(mystery)\b/i, "Mystery"],
  [/\b(fantasy)\b/i, "Fantasy"],
  [/\b(adventure)\b/i, "Adventure"],
  [/\b(drama|dramatic)\b/i, "Drama"],
];

export const LOCAL_LANGUAGE_PATTERNS: Array<[RegExp, string]> = [
  [/\b(french|france|francaise?|français|francais)\b/i, "fr"],
  [/\b(italian|italy)\b/i, "it"],
  [/\b(german|germany|deutsch)\b/i, "de"],
  [/\b(japanese|japan)\b/i, "ja"],
  [/\b(spanish|spain|mexican|mexico)\b/i, "es"],
  [/\b(korean|korea)\b/i, "ko"],
  [/\b(chinese|china|mandarin|cantonese)\b/i, "zh"],
  [/\b(russian|russia)\b/i, "ru"],
  [/\b(portuguese|portugal|brazilian|brazil)\b/i, "pt"],
  [/\b(swedish|sweden)\b/i, "sv"],
];

export const LOCAL_CATEGORY_PATTERNS: Array<[RegExp, string]> = [
  [/\bbest picture\b/i, "Best Picture"],
  [/\bbest director\b/i, "Directing"],
  [/\bbest actress\b/i, "Actress"],
  [/\bbest actor\b/i, "Actor"],
  [/\bbest screenplay\b/i, "Writing"],
  // Require award context: "stunning cinematography" praises the craft, only
  // "best cinematography" / "cinematography award" names the category.
  [/\b(best cinematography|cinematography (award|oscar|winner))\b/i, "Cinematography"],
  [/\bforeign language\b|\binternational feature\b/i, "International Feature"],
];

// Soft-preference extraction for the local (no-Gemini) path. Tones are the
// emotional register of the request; keywords are craft/style qualities.
// Both feed the weighted reranker, never the SQL filters.
export const LOCAL_TONE_PATTERNS: Array<[RegExp, string]> = [
  [/\bbitter[-\s]?sweet\b/i, "bittersweet"],
  [/\b(emotional|moving|touching|tear[-\s]?jerker)\b/i, "emotional"],
  [/\b(uplifting|feel[-\s]?good|heartwarming|inspiring)\b/i, "uplifting"],
  [/\b(dark|bleak|grim)\b/i, "dark"],
  [/\b(melanchol(y|ic)|sad|somber|wistful)\b/i, "melancholic"],
  [/\b(romantic|tender)\b/i, "romantic"],
  [/\b(tense|suspenseful|gripping)\b/i, "tense"],
  [/\b(nostalgi(a|c))\b/i, "nostalgic"],
];

export const LOCAL_KEYWORD_PATTERNS: Array<[RegExp, string]> = [
  [/\b(cinematograph(y|er)|visually\s+(stunning|striking)|stunning\s+visuals?)\b/i, "cinematography"],
  [/\bcharacter[-\s]?driven\b/i, "character-driven"],
  [/\b(musical|beautiful\s+music|great\s+(music|soundtrack)|soundtrack|score)\b/i, "musical"],
  [/\b(memorable|great|powerful)\s+(performances?|acting)\b/i, "performances"],
  [/\b(bitter[-\s]?sweet|sad|tragic|unhappy)\s+ending\b/i, "bittersweet ending"],
  [/\b(slow[-\s]?burn)\b/i, "slow-burn"],
  [/\b(dialogue[-\s]?driven|talky)\b/i, "dialogue-driven"],
];

export const LOCAL_SEMANTIC_KEYWORDS: Record<string, string[]> = {
  ambition: ["ambition", "ambitious", "dream", "dreams", "aspiring", "career"],
  beautiful: ["beautiful", "poetic", "lyrical", "tender", "moving", "romantic"],
  bittersweet: ["bittersweet", "melancholy", "wistful", "nostalgic", "heartbreak", "parting"],
  cinematography: ["cinematography", "visual", "visually", "striking", "vivid", "colorful", "cinematic"],
  "character-driven": ["character", "intimate", "portrait", "relationship", "personal"],
  dark: ["dark", "bleak", "grim", "violent", "disturbing", "sinister"],
  emotional: ["emotional", "moving", "poignant", "tender", "heartfelt", "touching"],
  fear: ["fear", "terror", "dread", "haunting", "nightmare", "threat"],
  gore: ["gore", "bloody", "blood", "slasher"],
  melancholic: ["melancholy", "grief", "loss", "lonely", "wistful", "somber"],
  music: ["music", "musical", "musician", "jazz", "song", "singer", "soundtrack", "composer", "pianist", "band"],
  musical: ["musical", "music", "musician", "jazz", "song", "singer", "soundtrack", "composer", "pianist"],
  nostalgic: ["nostalgic", "nostalgia", "memory", "past", "childhood"],
  performances: ["performance", "actor", "actress", "portrayal", "role"],
  psychological: ["psychological", "paranoia", "obsession", "mind", "mental", "fear"],
  romance: ["romance", "romantic", "love", "lovers", "relationship", "couple"],
  romantic: ["romantic", "romance", "love", "lovers", "relationship", "couple"],
  sad: ["grief", "loss", "mourning", "melancholy", "tragic", "lonely", "heartbreak"],
  tense: ["tense", "suspense", "thriller", "gripping", "cat-and-mouse"],
  underrated: ["hidden", "obscure", "overlooked", "cult", "independent"],
  uplifting: ["uplifting", "hope", "joy", "inspiring", "feel-good", "triumph"],
};
