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
  [/\bcinematograph(y|er)\b/i, "Cinematography"],
  [/\bforeign language\b|\binternational feature\b/i, "International Feature"],
];

export const LOCAL_SEMANTIC_KEYWORDS: Record<string, string[]> = {
  beautiful: ["beautiful", "poetic", "lyrical", "tender", "moving", "romantic"],
  dark: ["dark", "bleak", "grim", "violent", "disturbing", "sinister"],
  fear: ["fear", "terror", "dread", "haunting", "nightmare", "threat"],
  gore: ["gore", "bloody", "blood", "slasher"],
  psychological: ["psychological", "paranoia", "obsession", "mind", "mental", "fear"],
  sad: ["grief", "loss", "mourning", "melancholy", "tragic", "lonely", "heartbreak"],
  underrated: ["hidden", "obscure", "overlooked", "cult", "independent"],
  uplifting: ["uplifting", "hope", "joy", "inspiring", "feel-good", "triumph"],
};
