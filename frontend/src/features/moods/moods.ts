/**
 * Mood pages: one AI-assigned mood tag each (backend `moodTagVocabulary.ts`).
 * Only tags people actually search for get a page; the slug is the tag itself.
 */
export const MOODS = [
  { tag: "feel-good", name: "Feel-Good", blurb: "Award-winning films that leave you better than they found you — warm, funny and uplifting." },
  { tag: "uplifting", name: "Uplifting", blurb: "Films about people beating the odds, finding each other or simply getting through — and the awards they won for it." },
  { tag: "heartwarming", name: "Heartwarming", blurb: "Tender, kind-hearted films about family, friendship and second chances." },
  { tag: "bittersweet", name: "Bittersweet", blurb: "Films that make you smile and ache at the same time — happy and sad in the same breath." },
  { tag: "romantic", name: "Romantic", blurb: "Award-winning love stories, from classic Hollywood romance to quiet European heartbreak." },
  { tag: "dark", name: "Dark", blurb: "Bleak, uncompromising films that juries rewarded for going where most films won't." },
  { tag: "tense", name: "Tense", blurb: "Thrillers and dramas that keep you on the edge of your seat from the first scene to the last." },
  { tag: "haunting", name: "Haunting", blurb: "Films that stay with you for days after the credits roll." },
  { tag: "melancholic", name: "Melancholic", blurb: "Quiet, wistful films about loss, memory and the passing of time." },
  { tag: "whimsical", name: "Whimsical", blurb: "Playful, inventive films with a light touch and a strange, lovely logic of their own." },
  { tag: "nostalgic", name: "Nostalgic", blurb: "Films that look back — at childhood, lost places and earlier times." },
  { tag: "slow-burn", name: "Slow-Burn", blurb: "Patient films that build quietly and pay off in a big way." },
  { tag: "twist-ending", name: "Twist Ending", blurb: "Award-winning films with an ending that changes everything you just watched." },
  { tag: "happy-ending", name: "Happy Ending", blurb: "Award winners that end on a high note — for nights when you want things to work out." },
  { tag: "coming-of-age", name: "Coming-of-Age", blurb: "Films about growing up: first loves, first losses and finding out who you are." },
  { tag: "black-and-white", name: "Black-and-White", blurb: "Award-winning films shot in black and white, from Hollywood classics to modern art-house." },
  { tag: "epic", name: "Epic", blurb: "Big, sweeping films — wars, empires and lives told on the largest scale." },
  { tag: "surreal", name: "Surreal", blurb: "Dreamlike, rule-breaking films that juries rewarded for their nerve." },
] as const;
