import openpyxl
from collections import Counter

wb = openpyxl.Workbook()
ws = wb.active

headers = ["Id", "Award Year", "Movie Name", "Release Year", "Film Type", "Type Of Award", "Award Winner", "Award Nominee"]
ws.append(headers)

rows = [
    # A Damsel in Distress
    ("OSC-1938-02", 1938, "A Damsel in Distress", 1937, "movie", "Dance Direction", '"Fun House" from "A Damsel in Distress"', '"Fun House" from "A Damsel in Distress"'),
    ("OSC-1938-02", 1938, "A Damsel in Distress", 1937, "movie", "Art Direction", "NaN", "Carroll Clark"),

    # A Day at the Races
    ("OSC-1938-03", 1938, "A Day at the Races", 1937, "movie", "Dance Direction", "NaN", '"All God\'s Children Got Rhythm" from "A Day at the Races"'),

    # A Night at the Movies
    ("OSC-1938-04", 1938, "A Night at the Movies", 1937, "Live Action Short Film", "Short Subject (One-reel)", "NaN", "Metro-Goldwyn-Mayer"),

    # A Star Is Born
    ("OSC-1938-05", 1938, "A Star Is Born", 1937, "movie", "Actor", "NaN", "Fredric March"),
    ("OSC-1938-05", 1938, "A Star Is Born", 1937, "movie", "Actress", "NaN", "Janet Gaynor"),
    ("OSC-1938-05", 1938, "A Star Is Born", 1937, "movie", "Assistant Director", "NaN", "Eric Stacey"),
    ("OSC-1938-05", 1938, "A Star Is Born", 1937, "movie", "Directing", "NaN", "William Wellman"),
    ("OSC-1938-05", 1938, "A Star Is Born", 1937, "movie", "Outstanding Production", "NaN", "Selznick International Pictures"),
    ("OSC-1938-05", 1938, "A Star Is Born", 1937, "movie", "Special Award", "Special Award", "Special Award"),
    ("OSC-1938-05", 1938, "A Star Is Born", 1937, "movie", "Writing (Original Story)", "William A. Wellman, Robert Carson", "William A. Wellman, Robert Carson"),
    ("OSC-1938-05", 1938, "A Star Is Born", 1937, "movie", "Writing (Screenplay)", "NaN", "Dorothy Parker, Alan Campbell, Robert Carson"),

    # Ali Baba Goes to Town
    ("OSC-1938-06", 1938, "Ali Baba Goes to Town", 1937, "movie", "Dance Direction", "NaN", '"Swing Is Here to Stay" from "Ali Baba Goes to Town"'),

    # Artists and Models
    ("OSC-1938-07", 1938, "Artists and Models", 1937, "movie", "Music (Song)", "NaN", 'Whispers In The Dark in "Artists and Models" Music by Frederick Hollander; Lyrics by Leo Robin'),

    # Black Legion
    ("OSC-1938-09", 1938, "Black Legion", 1937, "movie", "Writing (Original Story)", "NaN", "Robert Lord"),

    # Camille
    ("OSC-1938-10", 1938, "Camille", 1937, "movie", "Actress", "NaN", "Greta Garbo"),

    # Captains Courageous
    ("OSC-1938-11", 1938, "Captains Courageous", 1937, "movie", "Actor", "Spencer Tracy", "Spencer Tracy"),
    ("OSC-1938-11", 1938, "Captains Courageous", 1937, "movie", "Film Editing", "NaN", "Elmo Veron"),
    ("OSC-1938-11", 1938, "Captains Courageous", 1937, "movie", "Outstanding Production", "NaN", "Metro-Goldwyn-Mayer"),
    ("OSC-1938-11", 1938, "Captains Courageous", 1937, "movie", "Writing (Screenplay)", "NaN", "John Lee Mahin, Marc Connelly, Dale Van Every"),

    # Conquest
    ("OSC-1938-13", 1938, "Conquest", 1937, "movie", "Actor", "NaN", "Charles Boyer"),
    ("OSC-1938-13", 1938, "Conquest", 1937, "movie", "Art Direction", "NaN", "Cedric Gibbons, William Horning"),

    # Darryl F. Zanuck (Irving G. Thalberg Memorial Award)
    ("OSC-1938-15", 1938, "Darryl F. Zanuck", 1937, "movie", "Irving G. Thalberg Memorial Award", "Darryl F. Zanuck", "Darryl F. Zanuck"),

    # Dead End
    ("OSC-1938-16", 1938, "Dead End", 1937, "movie", "Actress in a Supporting Role", "NaN", "Claire Trevor"),
    ("OSC-1938-16", 1938, "Dead End", 1937, "movie", "Art Direction", "NaN", "Richard Day"),
    ("OSC-1938-16", 1938, "Dead End", 1937, "movie", "Cinematography", "NaN", "Gregg Toland"),
    ("OSC-1938-16", 1938, "Dead End", 1937, "movie", "Outstanding Production", "NaN", "Samuel Goldwyn Productions"),

    # Deep South
    ("OSC-1938-17", 1938, "Deep South", 1937, "Live Action Short Film", "Short Subject (Two-reel)", "NaN", "RKO Radio"),

    # Educated Fish
    ("OSC-1938-18", 1938, "Educated Fish", 1937, "Animated Short Film", "Short Subject (Cartoon)", "NaN", "Paramount"),

    # Every Day's a Holiday
    ("OSC-1938-19", 1938, "Every Day's a Holiday", 1937, "movie", "Art Direction", "NaN", "Wiard Ihnen"),

    # Hitting a New High
    ("OSC-1938-22", 1938, "Hitting a New High", 1937, "movie", "Sound Recording", "NaN", "RKO Radio Studio Sound Department, John Aalberg, Sound Director"),

    # In Old Chicago
    ("OSC-1938-23", 1938, "In Old Chicago", 1937, "movie", "Actress in a Supporting Role", "Alice Brady", "Alice Brady"),
    ("OSC-1938-23", 1938, "In Old Chicago", 1937, "movie", "Assistant Director", "Robert Webb", "Robert Webb"),
    ("OSC-1938-23", 1938, "In Old Chicago", 1937, "movie", "Music (Scoring)", "NaN", "20th Century-Fox Studio Music Department, Louis Silvers, head of department (no composer credit)"),
    ("OSC-1938-23", 1938, "In Old Chicago", 1937, "movie", "Outstanding Production", "NaN", "20th Century-Fox"),
    ("OSC-1938-23", 1938, "In Old Chicago", 1937, "movie", "Sound Recording", "NaN", "20th Century-Fox Studio Sound Department, E. H. Hansen, Sound Director"),
    ("OSC-1938-23", 1938, "In Old Chicago", 1937, "movie", "Writing (Original Story)", "NaN", "Niven Busch"),

    # Lost Horizon
    ("OSC-1938-24", 1938, "Lost Horizon", 1937, "movie", "Art Direction", "Stephen Goosson", "Stephen Goosson"),
    ("OSC-1938-24", 1938, "Lost Horizon", 1937, "movie", "Film Editing", "Gene Havlick, Gene Milford", "Gene Havlick, Gene Milford"),
    ("OSC-1938-24", 1938, "Lost Horizon", 1937, "movie", "Actor in a Supporting Role", "NaN", "H. B. Warner"),
    ("OSC-1938-24", 1938, "Lost Horizon", 1937, "movie", "Assistant Director", "NaN", "C. C. Coleman, Jr."),
    ("OSC-1938-24", 1938, "Lost Horizon", 1937, "movie", "Music (Scoring)", "NaN", "Columbia Studio Music Department, Morris Stoloff, head of department (Score by Dimitri Tiomkin)"),
    ("OSC-1938-24", 1938, "Lost Horizon", 1937, "movie", "Outstanding Production", "NaN", "Columbia"),
    ("OSC-1938-24", 1938, "Lost Horizon", 1937, "movie", "Sound Recording", "NaN", "Columbia Studio Sound Department, John Livadary, Sound Director"),

    # Make a Wish
    ("OSC-1938-25", 1938, "Make a Wish", 1937, "movie", "Music (Scoring)", "NaN", "Principal Productions, Dr. Hugo Riesenfeld, musical director (Score by Dr. Hugo Riesenfeld)"),

    # Manhattan Merry-Go-Round
    ("OSC-1938-26", 1938, "Manhattan Merry-Go-Round", 1937, "movie", "Art Direction", "NaN", "John Victor Mackay"),

    # Maytime
    ("OSC-1938-27", 1938, "Maytime", 1937, "movie", "Music (Scoring)", "NaN", "Metro-Goldwyn-Mayer Studio Music Department, Nat W. Finston, head of department (Score by Herbert Stothart)"),
    ("OSC-1938-27", 1938, "Maytime", 1937, "movie", "Sound Recording", "NaN", "Metro-Goldwyn-Mayer Studio Sound Department, Douglas Shearer, Sound Director"),

    # Mr. Dodd Takes the Air
    ("OSC-1938-29", 1938, "Mr. Dodd Takes the Air", 1937, "movie", "Music (Song)", "NaN", 'Remember Me in "Mr. Dodd Takes the Air" Music by Harry Warren; Lyrics by Al Dubin'),

    # Night Must Fall
    ("OSC-1938-31", 1938, "Night Must Fall", 1937, "movie", "Actor", "NaN", "Robert Montgomery"),
    ("OSC-1938-31", 1938, "Night Must Fall", 1937, "movie", "Actress in a Supporting Role", "NaN", "Dame May Whitty"),

    # One Hundred Men and a Girl
    ("OSC-1938-32", 1938, "One Hundred Men and a Girl", 1937, "movie", "Music (Scoring)", "Universal Studio Music Department, Charles Previn, head of department (no composer credit)", "Universal Studio Music Department, Charles Previn, head of department (no composer credit)"),
    ("OSC-1938-32", 1938, "One Hundred Men and a Girl", 1937, "movie", "Film Editing", "NaN", "Bernard W. Burton"),
    ("OSC-1938-32", 1938, "One Hundred Men and a Girl", 1937, "movie", "Outstanding Production", "NaN", "Universal"),
    ("OSC-1938-32", 1938, "One Hundred Men and a Girl", 1937, "movie", "Sound Recording", "NaN", "Universal Studio Sound Department, Homer G. Tasker, Sound Director"),
    ("OSC-1938-32", 1938, "One Hundred Men and a Girl", 1937, "movie", "Writing (Original Story)", "NaN", "Hans Kraly"),

    # Penny Wisdom
    ("OSC-1938-35", 1938, "Penny Wisdom", 1937, "Live Action Short Film", "Short Subject (Color)", "Pete Smith, Producer", "Pete Smith, Producer"),

    # Popular Science J-7-1
    ("OSC-1938-36", 1938, "Popular Science J-7-1", 1937, "Live Action Short Film", "Short Subject (Color)", "NaN", "Paramount"),

    # Portia on Trial
    ("OSC-1938-37", 1938, "Portia on Trial", 1937, "movie", "Music (Scoring)", "NaN", "Republic Studio Music Department, Alberto Colombo, head of department (Score by Alberto Colombo)"),

    # Quality Street
    ("OSC-1938-39", 1938, "Quality Street", 1937, "movie", "Music (Scoring)", "NaN", "RKO Radio Studio Music Department, Roy Webb, musical director (Score by Roy Webb)"),

    # Ready, Willing and Able
    ("OSC-1938-41", 1938, "Ready, Willing and Able", 1937, "movie", "Dance Direction", "NaN", '"Too Marvelous for Words" from "Ready, Willing and Able"'),

    # Romance of Radium
    ("OSC-1938-43", 1938, "Romance of Radium", 1937, "Live Action Short Film", "Short Subject (One-reel)", "NaN", "Pete Smith, Producer"),

    # Shall We Dance
    ("OSC-1938-46", 1938, "Shall We Dance", 1937, "movie", "Music (Song)", "NaN", 'They Can\'t Take That Away From Me in "Shall We Dance" Music by George Gershwin; Lyrics by Ira Gershwin'),

    # Should Wives Work?
    ("OSC-1938-48", 1938, "Should Wives Work?", 1937, "Live Action Short Film", "Short Subject (Two-reel)", "NaN", "RKO Radio"),

    # Snow White and the Seven Dwarfs
    ("OSC-1938-49", 1938, "Snow White and the Seven Dwarfs", 1937, "movie", "Music (Scoring)", "NaN", "Walt Disney Studio Music Department, Leigh Harline, head of department (Score by Frank Churchill, Leigh Harline and Paul J. Smith)"),

    # Something to Sing About
    ("OSC-1938-50", 1938, "Something to Sing About", 1937, "movie", "Music (Scoring)", "NaN", "Grand National Studio Music Department, C. Bakaleinikoff, musical director (Score by Victor Schertzinger)"),

    # Souls at Sea
    ("OSC-1938-51", 1938, "Souls at Sea", 1937, "movie", "Art Direction", "NaN", "Hans Dreier, Roland Anderson"),
    ("OSC-1938-51", 1938, "Souls at Sea", 1937, "movie", "Assistant Director", "NaN", "Hal Walker"),
    ("OSC-1938-51", 1938, "Souls at Sea", 1937, "movie", "Music (Scoring)", "NaN", "Paramount Studio Music Department, Boris Morros, head of department (Score by W. Franke Harling and Milan Roder)"),

    # Stage Door
    ("OSC-1938-52", 1938, "Stage Door", 1937, "movie", "Actress in a Supporting Role", "NaN", "Andrea Leeds"),
    ("OSC-1938-52", 1938, "Stage Door", 1937, "movie", "Directing", "NaN", "Gregory La Cava"),
    ("OSC-1938-52", 1938, "Stage Door", 1937, "movie", "Outstanding Production", "NaN", "RKO Radio"),
    ("OSC-1938-52", 1938, "Stage Door", 1937, "movie", "Writing (Screenplay)", "NaN", "Morris Ryskind, Anthony Veiller"),

    # Stella Dallas
    ("OSC-1938-53", 1938, "Stella Dallas", 1937, "movie", "Actress", "NaN", "Barbara Stanwyck"),
    ("OSC-1938-53", 1938, "Stella Dallas", 1937, "movie", "Actress in a Supporting Role", "NaN", "Anne Shirley"),

    # The Awful Truth
    ("OSC-1938-54", 1938, "The Awful Truth", 1937, "movie", "Directing", "Leo McCarey", "Leo McCarey"),
    ("OSC-1938-54", 1938, "The Awful Truth", 1937, "movie", "Actor in a Supporting Role", "NaN", "Ralph Bellamy"),
    ("OSC-1938-54", 1938, "The Awful Truth", 1937, "movie", "Actress", "NaN", "Irene Dunne"),
    ("OSC-1938-54", 1938, "The Awful Truth", 1937, "movie", "Film Editing", "NaN", "Al Clark"),
    ("OSC-1938-54", 1938, "The Awful Truth", 1937, "movie", "Outstanding Production", "NaN", "Columbia"),
    ("OSC-1938-54", 1938, "The Awful Truth", 1937, "movie", "Writing (Screenplay)", "NaN", "Vina Delmar"),

    # The Girl Said No
    ("OSC-1938-55", 1938, "The Girl Said No", 1937, "movie", "Sound Recording", "NaN", "Grand National Studio Sound Department, A. E. Kaye, Sound Director"),

    # The Good Earth
    ("OSC-1938-56", 1938, "The Good Earth", 1937, "movie", "Actress", "Luise Rainer", "Luise Rainer"),
    ("OSC-1938-56", 1938, "The Good Earth", 1937, "movie", "Cinematography", "Karl Freund", "Karl Freund"),
    ("OSC-1938-56", 1938, "The Good Earth", 1937, "movie", "Directing", "NaN", "Sidney Franklin"),
    ("OSC-1938-56", 1938, "The Good Earth", 1937, "movie", "Film Editing", "NaN", "Basil Wrangell"),
    ("OSC-1938-56", 1938, "The Good Earth", 1937, "movie", "Outstanding Production", "NaN", "Metro-Goldwyn-Mayer"),

    # The Hurricane
    ("OSC-1938-57", 1938, "The Hurricane", 1937, "movie", "Sound Recording", "United Artists Studio Sound Department, Thomas T. Moulton, Sound Director", "United Artists Studio Sound Department, Thomas T. Moulton, Sound Director"),
    ("OSC-1938-57", 1938, "The Hurricane", 1937, "movie", "Actor in a Supporting Role", "NaN", "Thomas Mitchell"),
    ("OSC-1938-57", 1938, "The Hurricane", 1937, "movie", "Music (Scoring)", "NaN", "Samuel Goldwyn Studio Music Department, Alfred Newman, head of department (Score by Alfred Newman)"),

    # The Life of Emile Zola
    ("OSC-1938-58", 1938, "The Life of Emile Zola", 1937, "movie", "Actor in a Supporting Role", "Joseph Schildkraut", "Joseph Schildkraut"),
    ("OSC-1938-58", 1938, "The Life of Emile Zola", 1937, "movie", "Outstanding Production", "Warner Bros.", "Warner Bros."),
    ("OSC-1938-58", 1938, "The Life of Emile Zola", 1937, "movie", "Writing (Screenplay)", "Norman Reilly Raine, Heinz Herald, Geza Herczeg", "Norman Reilly Raine, Heinz Herald, Geza Herczeg"),
    ("OSC-1938-58", 1938, "The Life of Emile Zola", 1937, "movie", "Actor", "NaN", "Paul Muni"),
    ("OSC-1938-58", 1938, "The Life of Emile Zola", 1937, "movie", "Art Direction", "NaN", "Anton Grot"),
    ("OSC-1938-58", 1938, "The Life of Emile Zola", 1937, "movie", "Assistant Director", "NaN", "Russ Saunders"),
    ("OSC-1938-58", 1938, "The Life of Emile Zola", 1937, "movie", "Directing", "NaN", "William Dieterle"),
    ("OSC-1938-58", 1938, "The Life of Emile Zola", 1937, "movie", "Music (Scoring)", "NaN", "Warner Bros. Studio Music Department, Leo Forbstein, head of department (Score by Max Steiner)"),
    ("OSC-1938-58", 1938, "The Life of Emile Zola", 1937, "movie", "Sound Recording", "NaN", "Warner Bros. Studio Sound Department, Nathan Levinson, Sound Director"),
    ("OSC-1938-58", 1938, "The Life of Emile Zola", 1937, "movie", "Writing (Original Story)", "NaN", "Heinz Herald, Geza Herczeg"),

    # The Little Match Girl
    ("OSC-1938-59", 1938, "The Little Match Girl", 1937, "Animated Short Film", "Short Subject (Cartoon)", "NaN", "Charles Mintz, Producer"),

    # The Man without a Country
    ("OSC-1938-60", 1938, "The Man without a Country", 1937, "Live Action Short Film", "Short Subject (Color)", "NaN", "Warner Bros."),

    # The Old Mill
    ("OSC-1938-61", 1938, "The Old Mill", 1937, "Animated Short Film", "Short Subject (Cartoon)", "Walt Disney, Producer", "Walt Disney, Producer"),

    # The Prisoner of Zenda
    ("OSC-1938-62", 1938, "The Prisoner of Zenda", 1937, "movie", "Art Direction", "NaN", "Lyle Wheeler"),
    ("OSC-1938-62", 1938, "The Prisoner of Zenda", 1937, "movie", "Music (Scoring)", "NaN", "Selznick International Pictures Music Department, Alfred Newman, musical director (Score by Alfred Newman)"),

    # The Private Life of the Gannets
    ("OSC-1938-63", 1938, "The Private Life of the Gannets", 1937, "Live Action Short Film", "Short Subject (One-reel)", "Skibo Productions", "Skibo Productions"),

    # Thin Ice
    ("OSC-1938-64", 1938, "Thin Ice", 1937, "movie", "Dance Direction", "NaN", '"Prince Igor Suite" from "Thin Ice"'),

    # Topper
    ("OSC-1938-65", 1938, "Topper", 1937, "movie", "Actor in a Supporting Role", "NaN", "Roland Young"),
    ("OSC-1938-65", 1938, "Topper", 1937, "movie", "Sound Recording", "NaN", "Hal Roach Studio Sound Department, Elmer A. Raguse, Sound Director"),

    # Torture Money
    ("OSC-1938-66", 1938, "Torture Money", 1937, "Live Action Short Film", "Short Subject (Two-reel)", "Metro-Goldwyn-Mayer", "Metro-Goldwyn-Mayer"),

    # Varsity Show
    ("OSC-1938-68", 1938, "Varsity Show", 1937, "movie", "Dance Direction", "NaN", '"The Finale" from "Varsity Show"'),

    # Waikiki Wedding
    ("OSC-1938-69", 1938, "Waikiki Wedding", 1937, "movie", "Music (Song)", 'Sweet Leilani in "Waikiki Wedding" Music and Lyrics by Harry Owens', 'Sweet Leilani in "Waikiki Wedding" Music and Lyrics by Harry Owens'),
    ("OSC-1938-69", 1938, "Waikiki Wedding", 1937, "movie", "Dance Direction", "NaN", '"Luau" from "Waikiki Wedding"'),

    # Walter Wanger's Vogues of 1938
    ("OSC-1938-71", 1938, "Walter Wanger's Vogues of 1938", 1937, "movie", "Art Direction", "NaN", "Alexander Toluboff"),
    ("OSC-1938-71", 1938, "Walter Wanger's Vogues of 1938", 1937, "movie", "Music (Song)", "NaN", 'That Old Feeling in "Walter Wanger\'s Vogues of 1938" Music by Sammy Fain; Lyrics by Lew Brown'),

    # Way Out West
    ("OSC-1938-73", 1938, "Way Out West", 1937, "movie", "Music (Scoring)", "NaN", "Hal Roach Studio Music Department, Marvin Hatley, head of department (Score by Marvin Hatley)"),

    # Wee Willie Winkie
    ("OSC-1938-74", 1938, "Wee Willie Winkie", 1937, "movie", "Art Direction", "NaN", "William S. Darling, David Hall"),

    # Wells Fargo
    ("OSC-1938-75", 1938, "Wells Fargo", 1937, "movie", "Sound Recording", "NaN", "Paramount Studio Sound Department, Loren L. Ryder, Sound Director"),

    # Wings over Honolulu
    ("OSC-1938-76", 1938, "Wings over Honolulu", 1937, "movie", "Cinematography", "NaN", "Joseph Valentine"),

    # You're a Sweetheart
    ("OSC-1938-78", 1938, "You're a Sweetheart", 1937, "movie", "Art Direction", "NaN", "Jack Otterson"),
]

for row in rows:
    ws.append(list(row))

path = "backend/film-data/movie excel datas/oscar/oscars_1938_structured.xlsx"
wb.save(path)

cats = Counter(r[5] for r in rows)
print(f"Saved {len(rows)} rows")
for cat, count in sorted(cats.items()):
    print(f"  {cat}: {count} rows")
