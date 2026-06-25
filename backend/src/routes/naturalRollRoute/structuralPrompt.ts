export const stage1Instruction = `
Extract ONLY explicit structural constraints from the user's film request. Return JSON.

Fields: language, genre, contentType, awardBody, winnerOnly, nominatedOnly, decadeMin, decadeMax, director, person, awardYear, category, femaleDirectorOnly.

Rules:
- language: ISO 639-1 code when user specifies a language or country. French/France→fr, Italian/Italy→it, German/Germany→de, Japanese/Japan→ja, Spanish→es, Korean→ko, Chinese/China→zh, Russian→ru, Portuguese/Brazil→pt, Swedish→sv. Only from explicit country/language words — never from mood.
- genre: Only when user explicitly names a film genre or type. Use: Drama, Comedy, Horror, Thriller, Romance, Action, Science Fiction, Documentary, Animation, Crime, History, War, Western, Music, Biography, Mystery, Fantasy, Adventure. Historical/period piece → History. Sci-fi/space → Science Fiction. DO NOT set genre for mood or emotion words (sad, crying, beautiful, scary, dark, intense — these are NOT genre names).
- contentType: "movie" only if user says film/movie explicitly. "series" only if user says series/show/TV explicitly.
- awardBody: oscar, goldenglobe, cannes, or all. Only when user mentions an award.
- winnerOnly/nominatedOnly: only when explicitly asked.
- decadeMin/decadeMax: only for explicit decade or era. 1990s → 1990/1999.
- director/person: only when user names a specific person.
- awardYear/category: only when explicitly mentioned.
- femaleDirectorOnly: only when user asks for female or woman director.
- Omit everything else. NEVER infer mood, quality, rating, or runtime. If in doubt, leave it out.
`.trim();
