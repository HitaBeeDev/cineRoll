import openpyxl

wb = openpyxl.Workbook()
ws = wb.active

headers = ["Id", "Award Year", "Movie Name", "Release Year", "Film Type", "Type Of Award", "Award Winner", "Award Nominee"]
ws.append(headers)

rows = [
    # A Tale of Two Cities
    ("OSC-1937-01", 1937, "A Tale of Two Cities", 1935, "movie", "Film Editing", "NaN", "Conrad A. Nervig"),
    ("OSC-1937-01", 1937, "A Tale of Two Cities", 1935, "movie", "Outstanding Production", "NaN", "Metro-Goldwyn-Mayer"),

    # After the Thin Man
    ("OSC-1937-02", 1937, "After the Thin Man", 1936, "movie", "Writing (Screenplay)", "NaN", "Frances Goodrich, Albert Hackett"),

    # Anthony Adverse
    ("OSC-1937-03", 1937, "Anthony Adverse", 1936, "movie", "Actress in a Supporting Role", "Gale Sondergaard", "Gale Sondergaard"),
    ("OSC-1937-03", 1937, "Anthony Adverse", 1936, "movie", "Cinematography", "Gaetano Gaudio", "Gaetano Gaudio"),
    ("OSC-1937-03", 1937, "Anthony Adverse", 1936, "movie", "Film Editing", "Ralph Dawson", "Ralph Dawson"),
    ("OSC-1937-03", 1937, "Anthony Adverse", 1936, "movie", "Music (Scoring)", "Warner Bros. Studio Music Department, Leo Forbstein, head of department (Score by Erich Wolfgang Korngold)", "Warner Bros. Studio Music Department, Leo Forbstein, head of department (Score by Erich Wolfgang Korngold)"),
    ("OSC-1937-03", 1937, "Anthony Adverse", 1936, "movie", "Art Direction", "NaN", "Anton Grot"),
    ("OSC-1937-03", 1937, "Anthony Adverse", 1936, "movie", "Assistant Director", "NaN", "William Cannon"),
    ("OSC-1937-03", 1937, "Anthony Adverse", 1936, "movie", "Outstanding Production", "NaN", "Warner Bros."),

    # Banjo on My Knee
    ("OSC-1937-05", 1937, "Banjo on My Knee", 1936, "movie", "Sound Recording", "NaN", "20th Century-Fox Studio Sound Department, E. H. Hansen, Sound Director"),

    # Bored of Education
    ("OSC-1937-06", 1937, "Bored of Education", 1936, "Live Action Short Film", "Short Subject (One-reel)", "Hal Roach, Producer", "Hal Roach, Producer"),

    # Born to Dance
    ("OSC-1937-07", 1937, "Born to Dance", 1936, "movie", "Dance Direction", "NaN", '"Swingin\' the Jinx" from "Born to Dance"'),
    ("OSC-1937-07", 1937, "Born to Dance", 1936, "movie", "Music (Song)", "NaN", 'I\'ve Got You Under My Skin in "Born to Dance" Music and Lyrics by Cole Porter'),

    # Cain and Mabel
    ("OSC-1937-08", 1937, "Cain and Mabel", 1936, "movie", "Dance Direction", "NaN", '"1000 Love Songs" from "Cain and Mabel"'),

    # The Charge of the Light Brigade
    ("OSC-1937-40", 1937, "The Charge of the Light Brigade", 1936, "movie", "Assistant Director", "Jack Sullivan", "Jack Sullivan"),
    ("OSC-1937-40", 1937, "The Charge of the Light Brigade", 1936, "movie", "Music (Scoring)", "NaN", "Warner Bros. Studio Music Department, Leo Forbstein, head of department (Score by Max Steiner)"),
    ("OSC-1937-40", 1937, "The Charge of the Light Brigade", 1936, "movie", "Sound Recording", "NaN", "Warner Bros. Studio Sound Department, Nathan Levinson, Sound Director"),

    # Come and Get It
    ("OSC-1937-09", 1937, "Come and Get It", 1936, "movie", "Actor in a Supporting Role", "Walter Brennan", "Walter Brennan"),
    ("OSC-1937-09", 1937, "Come and Get It", 1936, "movie", "Film Editing", "NaN", "Edward Curtiss"),

    # The Country Cousin
    ("OSC-1937-41", 1937, "The Country Cousin", 1936, "Animated Short Film", "Short Subject (Cartoon)", "Walt Disney, Producer", "Walt Disney, Producer"),

    # Dancing Pirate
    ("OSC-1937-11", 1937, "Dancing Pirate", 1936, "movie", "Dance Direction", "NaN", '"The Finale" from "Dancing Pirate"'),

    # Dodsworth
    ("OSC-1937-12", 1937, "Dodsworth", 1936, "movie", "Art Direction", "Richard Day", "Richard Day"),
    ("OSC-1937-12", 1937, "Dodsworth", 1936, "movie", "Actor", "NaN", "Walter Huston"),
    ("OSC-1937-12", 1937, "Dodsworth", 1936, "movie", "Actress in a Supporting Role", "NaN", "Maria Ouspenskaya"),
    ("OSC-1937-12", 1937, "Dodsworth", 1936, "movie", "Directing", "NaN", "William Wyler"),
    ("OSC-1937-12", 1937, "Dodsworth", 1936, "movie", "Outstanding Production", "NaN", "Samuel Goldwyn Productions"),
    ("OSC-1937-12", 1937, "Dodsworth", 1936, "movie", "Sound Recording", "NaN", "United Artists Studio Sound Department, Thomas T. Moulton, Sound Director"),
    ("OSC-1937-12", 1937, "Dodsworth", 1936, "movie", "Writing (Screenplay)", "NaN", "Sidney Howard"),

    # Double or Nothing
    ("OSC-1937-13", 1937, "Double or Nothing", 1936, "Live Action Short Film", "Short Subject (Two-reel)", "NaN", "Warner Bros."),

    # Dummy Ache
    ("OSC-1937-14", 1937, "Dummy Ache", 1936, "Live Action Short Film", "Short Subject (Two-reel)", "NaN", "RKO Radio"),

    # Fury
    ("OSC-1937-15", 1937, "Fury", 1936, "movie", "Writing (Original Story)", "NaN", "Norman Krasna"),

    # The Garden of Allah
    ("OSC-1937-42", 1937, "The Garden of Allah", 1936, "movie", "Special Award", "Special Award", "Special Award"),
    ("OSC-1937-42", 1937, "The Garden of Allah", 1936, "movie", "Assistant Director", "NaN", "Eric G. Stacey"),
    ("OSC-1937-42", 1937, "The Garden of Allah", 1936, "movie", "Music (Scoring)", "NaN", "Selznick International Pictures Music Department, Max Steiner, head of department (Score by Max Steiner)"),

    # The General Died at Dawn
    ("OSC-1937-43", 1937, "The General Died at Dawn", 1936, "movie", "Actor in a Supporting Role", "NaN", "Akim Tamiroff"),
    ("OSC-1937-43", 1937, "The General Died at Dawn", 1936, "movie", "Cinematography", "NaN", "Victor Milner"),
    ("OSC-1937-43", 1937, "The General Died at Dawn", 1936, "movie", "Music (Scoring)", "NaN", "Paramount Studio Music Department, Boris Morros, head of department (Score by Werner Janssen)"),

    # General Spanky
    ("OSC-1937-16", 1937, "General Spanky", 1936, "movie", "Sound Recording", "NaN", "Hal Roach Studio Sound Department, Elmer A. Raguse, Sound Director"),

    # Give Me Liberty
    ("OSC-1937-17", 1937, "Give Me Liberty", 1936, "Live Action Short Film", "Short Subject (Color)", "Warner Bros.", "Warner Bros."),

    # Gold Diggers of 1937
    ("OSC-1937-18", 1937, "Gold Diggers of 1937", 1936, "movie", "Dance Direction", "NaN", '"Love and War" from "Gold Diggers of 1937"'),

    # The Gorgeous Hussy
    ("OSC-1937-44", 1937, "The Gorgeous Hussy", 1936, "movie", "Actress in a Supporting Role", "NaN", "Beulah Bondi"),
    ("OSC-1937-44", 1937, "The Gorgeous Hussy", 1936, "movie", "Cinematography", "NaN", "George Folsey"),

    # The Great Ziegfeld
    ("OSC-1937-45", 1937, "The Great Ziegfeld", 1936, "movie", "Actress", "Luise Rainer", "Luise Rainer"),
    ("OSC-1937-45", 1937, "The Great Ziegfeld", 1936, "movie", "Dance Direction", '"A Pretty Girl Is Like a Melody" from "The Great Ziegfeld"', '"A Pretty Girl Is Like a Melody" from "The Great Ziegfeld"'),
    ("OSC-1937-45", 1937, "The Great Ziegfeld", 1936, "movie", "Outstanding Production", "Metro-Goldwyn-Mayer", "Metro-Goldwyn-Mayer"),
    ("OSC-1937-45", 1937, "The Great Ziegfeld", 1936, "movie", "Art Direction", "NaN", "Cedric Gibbons, Eddie Imazu, Edwin B. Willis"),
    ("OSC-1937-45", 1937, "The Great Ziegfeld", 1936, "movie", "Directing", "NaN", "Robert Z. Leonard"),
    ("OSC-1937-45", 1937, "The Great Ziegfeld", 1936, "movie", "Film Editing", "NaN", "William S. Gray"),
    ("OSC-1937-45", 1937, "The Great Ziegfeld", 1936, "movie", "Writing (Original Story)", "NaN", "William Anthony McGuire"),

    # La Fiesta de Santa Barbara
    ("OSC-1937-19", 1937, "La Fiesta de Santa Barbara", 1935, "Live Action Short Film", "Short Subject (Color)", "NaN", "Lewis Lewyn, Producer"),

    # The Last of the Mohicans
    ("OSC-1937-46", 1937, "The Last of the Mohicans", 1936, "movie", "Assistant Director", "NaN", "Clem Beauchamp"),

    # Libeled Lady
    ("OSC-1937-20", 1937, "Libeled Lady", 1936, "movie", "Outstanding Production", "NaN", "Metro-Goldwyn-Mayer"),

    # Lloyds of London
    ("OSC-1937-21", 1937, "Lloyds of London", 1936, "movie", "Art Direction", "NaN", "William S. Darling"),
    ("OSC-1937-21", 1937, "Lloyds of London", 1936, "movie", "Film Editing", "NaN", "Barbara McLean"),

    # The Magnificent Brute
    ("OSC-1937-47", 1937, "The Magnificent Brute", 1936, "movie", "Art Direction", "NaN", "Albert S. D'Agostino, Jack Otterson"),

    # Moscow Moods
    ("OSC-1937-22", 1937, "Moscow Moods", 1936, "Live Action Short Film", "Short Subject (One-reel)", "NaN", "Paramount"),

    # Mr. Deeds Goes to Town
    ("OSC-1937-23", 1937, "Mr. Deeds Goes to Town", 1936, "movie", "Directing", "Frank Capra", "Frank Capra"),
    ("OSC-1937-23", 1937, "Mr. Deeds Goes to Town", 1936, "movie", "Actor", "NaN", "Gary Cooper"),
    ("OSC-1937-23", 1937, "Mr. Deeds Goes to Town", 1936, "movie", "Outstanding Production", "NaN", "Columbia"),
    ("OSC-1937-23", 1937, "Mr. Deeds Goes to Town", 1936, "movie", "Sound Recording", "NaN", "Columbia Studio Sound Department, John Livadary, Sound Director"),
    ("OSC-1937-23", 1937, "Mr. Deeds Goes to Town", 1936, "movie", "Writing (Screenplay)", "NaN", "Robert Riskin"),

    # My Man Godfrey
    ("OSC-1937-25", 1937, "My Man Godfrey", 1936, "movie", "Actor", "NaN", "William Powell"),
    ("OSC-1937-25", 1937, "My Man Godfrey", 1936, "movie", "Actor in a Supporting Role", "NaN", "Mischa Auer"),
    ("OSC-1937-25", 1937, "My Man Godfrey", 1936, "movie", "Actress", "NaN", "Carole Lombard"),
    ("OSC-1937-25", 1937, "My Man Godfrey", 1936, "movie", "Actress in a Supporting Role", "NaN", "Alice Brady"),
    ("OSC-1937-25", 1937, "My Man Godfrey", 1936, "movie", "Directing", "NaN", "Gregory La Cava"),
    ("OSC-1937-25", 1937, "My Man Godfrey", 1936, "movie", "Writing (Screenplay)", "NaN", "Eric Hatch, Morris Ryskind"),

    # Old Mill Pond
    ("OSC-1937-26", 1937, "Old Mill Pond", 1936, "Animated Short Film", "Short Subject (Cartoon)", "NaN", "Harman-Ising"),

    # One in a Million
    ("OSC-1937-27", 1937, "One in a Million", 1936, "movie", "Dance Direction", "NaN", '"Skating Ensemble" from "One in a Million"'),

    # Pennies from Heaven
    ("OSC-1937-29", 1937, "Pennies from Heaven", 1936, "movie", "Music (Song)", "NaN", 'Pennies From Heaven in "Pennies from Heaven" Music by Arthur Johnston; Lyrics by Johnny Burke'),

    # Pigskin Parade
    ("OSC-1937-30", 1937, "Pigskin Parade", 1936, "movie", "Actor in a Supporting Role", "NaN", "Stuart Erwin"),

    # Popular Science J-6-2
    ("OSC-1937-31", 1937, "Popular Science J-6-2", 1936, "Live Action Short Film", "Short Subject (Color)", "NaN", "Paramount"),

    # The Public Pays
    ("OSC-1937-48", 1937, "The Public Pays", 1936, "Live Action Short Film", "Short Subject (Two-reel)", "Metro-Goldwyn-Mayer", "Metro-Goldwyn-Mayer"),

    # Romeo and Juliet
    ("OSC-1937-32", 1937, "Romeo and Juliet", 1936, "movie", "Actor in a Supporting Role", "NaN", "Basil Rathbone"),
    ("OSC-1937-32", 1937, "Romeo and Juliet", 1936, "movie", "Actress", "NaN", "Norma Shearer"),
    ("OSC-1937-32", 1937, "Romeo and Juliet", 1936, "movie", "Art Direction", "NaN", "Cedric Gibbons, Frederic Hope, Edwin B. Willis"),
    ("OSC-1937-32", 1937, "Romeo and Juliet", 1936, "movie", "Outstanding Production", "NaN", "Metro-Goldwyn-Mayer"),

    # San Francisco
    ("OSC-1937-33", 1937, "San Francisco", 1936, "movie", "Sound Recording", "Metro-Goldwyn-Mayer Studio Sound Department, Douglas Shearer, Sound Director", "Metro-Goldwyn-Mayer Studio Sound Department, Douglas Shearer, Sound Director"),
    ("OSC-1937-33", 1937, "San Francisco", 1936, "movie", "Actor", "NaN", "Spencer Tracy"),
    ("OSC-1937-33", 1937, "San Francisco", 1936, "movie", "Assistant Director", "NaN", "Joseph Newman"),
    ("OSC-1937-33", 1937, "San Francisco", 1936, "movie", "Directing", "NaN", "W. S. Van Dyke"),
    ("OSC-1937-33", 1937, "San Francisco", 1936, "movie", "Outstanding Production", "NaN", "Metro-Goldwyn-Mayer"),
    ("OSC-1937-33", 1937, "San Francisco", 1936, "movie", "Writing (Original Story)", "NaN", "Robert Hopkins"),

    # Sinbad the Sailor
    ("OSC-1937-35", 1937, "Sinbad the Sailor", 1936, "Animated Short Film", "Short Subject (Cartoon)", "NaN", "Paramount"),

    # Sing, Baby, Sing
    ("OSC-1937-36", 1937, "Sing, Baby, Sing", 1936, "movie", "Music (Song)", "NaN", 'When Did You Leave Heaven in "Sing, Baby, Sing" Music by Richard A. Whiting; Lyrics by Walter Bullock'),

    # The Story of Louis Pasteur
    ("OSC-1937-49", 1937, "The Story of Louis Pasteur", 1936, "movie", "Actor", "Paul Muni", "Paul Muni"),
    ("OSC-1937-49", 1937, "The Story of Louis Pasteur", 1936, "movie", "Writing (Original Story)", "Pierre Collings, Sheridan Gibney", "Pierre Collings, Sheridan Gibney"),
    ("OSC-1937-49", 1937, "The Story of Louis Pasteur", 1936, "movie", "Writing (Screenplay)", "Pierre Collings, Sheridan Gibney", "Pierre Collings, Sheridan Gibney"),
    ("OSC-1937-49", 1937, "The Story of Louis Pasteur", 1936, "movie", "Outstanding Production", "NaN", "Cosmopolitan"),

    # Suzy
    ("OSC-1937-37", 1937, "Suzy", 1936, "movie", "Music (Song)", "NaN", 'Did I Remember in "Suzy" Music by Walter Donaldson; Lyrics by Harold Adamson'),

    # Swing Time
    ("OSC-1937-38", 1937, "Swing Time", 1936, "movie", "Music (Song)", 'The Way You Look Tonight in "Swing Time" Music by Jerome Kern; Lyrics by Dorothy Fields', 'The Way You Look Tonight in "Swing Time" Music by Jerome Kern; Lyrics by Dorothy Fields'),
    ("OSC-1937-38", 1937, "Swing Time", 1936, "movie", "Dance Direction", "NaN", '"Bojangles of Harlem" from "Swing Time"'),

    # That Girl from Paris
    ("OSC-1937-39", 1937, "That Girl from Paris", 1936, "movie", "Sound Recording", "NaN", "RKO Radio Studio Sound Department, J. O. Aalberg, Sound Director"),

    # The Texas Rangers
    ("OSC-1937-50", 1937, "The Texas Rangers", 1936, "movie", "Sound Recording", "NaN", "Paramount Studio Sound Department, Franklin B. Hansen, Sound Director"),

    # Theodora Goes Wild
    ("OSC-1937-51", 1937, "Theodora Goes Wild", 1936, "movie", "Actress", "NaN", "Irene Dunne"),
    ("OSC-1937-51", 1937, "Theodora Goes Wild", 1936, "movie", "Film Editing", "NaN", "Otto Meyer"),

    # These Three
    ("OSC-1937-52", 1937, "These Three", 1936, "movie", "Actress in a Supporting Role", "NaN", "Bonita Granville"),

    # Three Smart Girls
    ("OSC-1937-53", 1937, "Three Smart Girls", 1936, "movie", "Outstanding Production", "NaN", "Universal"),
    ("OSC-1937-53", 1937, "Three Smart Girls", 1936, "movie", "Sound Recording", "NaN", "Universal Studio Sound Department, Homer G. Tasker, Sound Director"),
    ("OSC-1937-53", 1937, "Three Smart Girls", 1936, "movie", "Writing (Original Story)", "NaN", "Adele Comandini"),

    # Trail of the Lonesome Pine
    ("OSC-1937-54", 1937, "Trail of the Lonesome Pine", 1936, "movie", "Music (Song)", "NaN", 'A Melody From The Sky in "Trail of the Lonesome Pine" Music by Louis Alter; Lyrics by Sidney Mitchell'),

    # Valiant Is the Word for Carrie
    ("OSC-1937-55", 1937, "Valiant Is the Word for Carrie", 1936, "movie", "Actress", "NaN", "Gladys George"),

    # Wanted, a Master
    ("OSC-1937-56", 1937, "Wanted, a Master", 1936, "Live Action Short Film", "Short Subject (One-reel)", "NaN", "Pete Smith, Producer"),

    # Winterset
    ("OSC-1937-57", 1937, "Winterset", 1936, "movie", "Art Direction", "NaN", "Perry Ferguson"),
    ("OSC-1937-57", 1937, "Winterset", 1936, "movie", "Music (Scoring)", "NaN", "RKO Radio Studio Music Department, Nathaniel Shilkret, head of department (Score by Nathaniel Shilkret)"),
]

for row in rows:
    ws.append(list(row))

path = "backend/film-data/movie excel datas/oscar/oscars_1937_structured.xlsx"
wb.save(path)

# Summary
from collections import Counter
cats = Counter(r[5] for r in rows)
print(f"Saved {len(rows)} rows")
for cat, count in sorted(cats.items()):
    print(f"  {cat}: {count} rows")
