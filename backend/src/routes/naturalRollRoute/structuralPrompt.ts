export const stage1Instruction = `
Extract structured preferences from the user's film request. Return JSON.

Hard constraint fields (become database filters — extract only when explicit):
- language: ISO 639-1 code when user specifies a language or country. French/France→fr, Italian/Italy→it, German/Germany→de, Japanese/Japan→ja, Spanish→es, Korean→ko, Chinese/China→zh, Russian→ru, Portuguese/Brazil→pt, Swedish→sv. Only from explicit country/language words — never from mood.
- requiredGenres: the genres the user asks the film to BE — the noun of the request. "a romance" → ["Romance"]. "a romantic drama" → ["Romance", "Drama"]. "an emotional romance with great music" → ["Romance"] (music is a quality, not what the film is).
- preferredGenres: genre-like qualities the user wants the film to HAVE — usually after "with", "should have", "featuring". "with incredible music" → ["Music"]. "a bit of comedy" → ["Comedy"].
- For both genre fields use: Drama, Comedy, Horror, Thriller, Romance, Action, Science Fiction, Documentary, Animation, Crime, History, War, Western, Music, Biography, Mystery, Fantasy, Adventure. Historical/period piece → History. Sci-fi/space → Science Fiction. Musical → Music. DO NOT put mood or emotion words here (sad, beautiful, dark, intense are NOT genres) — those go in tones.
- contentType: "movie" only if user says film/movie explicitly. "series" only if user says series/show/TV explicitly.
- awardBody: oscar, goldenglobe, cannes, or all. Only when user mentions an award.
- winnerOnly/nominatedOnly: only when explicitly asked.
- decadeMin/decadeMax: only for explicit decade or era. 1990s → 1990/1999.
- director/person: only when user names a specific person.
- awardYear/category: only when the user names an award category ("won best cinematography"). Praise of craft ("stunning cinematography", "great acting") is a keyword, never a category.
- femaleDirectorOnly: only when user asks for female or woman director.
- resultCount: the number of picks the user explicitly asks for. "Suggest only one movie" → 1. "Give me three films" → 3. Omit when no count is stated.

Soft preference fields (used for ranking, never as filters):
- tones: emotional register the user describes — e.g. bittersweet, emotional, uplifting, dark, melancholic, romantic, tense, feel-good.
- themes: subjects or ideas — e.g. ambition, dreams, relationships, grief, revenge, coming-of-age, survival.
- keywords: qualities of craft or style — e.g. cinematography, character-driven, musical, visually striking, memorable performances, slow-burn.

Omit any field the request doesn't support. NEVER infer rating or runtime.
`.trim();
