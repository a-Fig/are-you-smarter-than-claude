/** Curated Marvel questions. Ten are drawn at random per game. */
export const MARVEL_QUESTIONS: {
  question: string;
  options: string[];
  correctIndex: number;
}[] = [
  {
    question:
      "Which 2008 film was the first release in the Marvel Cinematic Universe?",
    options: [
      "The Incredible Hulk",
      "Thor",
      "Iron Man",
      "Captain America: The First Avenger",
    ],
    correctIndex: 2,
  },
  {
    question: "Who directed the 2008 film Iron Man?",
    options: ["Jon Favreau", "Joss Whedon", "Shane Black", "Kenneth Branagh"],
    correctIndex: 0,
  },
  {
    question: "Who directed Avengers: Endgame?",
    options: [
      "Joss Whedon",
      "Anthony and Joe Russo",
      "James Gunn",
      "Jon Watts",
    ],
    correctIndex: 1,
  },
  {
    question:
      "In Thor: Ragnarok, on which planet does the Grandmaster run his gladiator contest?",
    options: ["Xandar", "Morag", "Knowhere", "Sakaar"],
    correctIndex: 3,
  },
  {
    question:
      "Which song plays as Star-Lord dances through the opening of Guardians of the Galaxy?",
    options: [
      "Hooked on a Feeling",
      "Come and Get Your Love",
      "Ain't No Mountain High Enough",
      "Mr. Blue Sky",
    ],
    correctIndex: 1,
  },
  {
    question: "WandaVision takes place in Westview, a town in which US state?",
    options: ["Connecticut", "Pennsylvania", "New Jersey", "New York"],
    correctIndex: 2,
  },
  {
    question: "What species is Goose, the cat introduced in Captain Marvel?",
    options: ["Flerken", "Skrull", "Kree", "Chitauri"],
    correctIndex: 0,
  },
  {
    question: "What is the name of Thanos' ruined home planet?",
    options: ["Sakaar", "Vormir", "Ego", "Titan"],
    correctIndex: 3,
  },
  {
    question: "In the MCU, which Infinity Stone was housed inside the Tesseract?",
    options: [
      "The Mind Stone",
      "The Reality Stone",
      "The Power Stone",
      "The Space Stone",
    ],
    correctIndex: 3,
  },
  {
    question:
      "The Aether from Thor: The Dark World was later revealed to be which Infinity Stone?",
    options: [
      "The Reality Stone",
      "The Soul Stone",
      "The Time Stone",
      "The Power Stone",
    ],
    correctIndex: 0,
  },
  {
    question:
      "In Avengers: Infinity War, which dwarf king helps Thor forge Stormbreaker?",
    options: ["Brokk", "Eitri", "Ivaldi", "Sindri"],
    correctIndex: 1,
  },
  {
    question: "Thor travels to which realm to have Stormbreaker forged?",
    options: ["Alfheim", "Svartalfheim", "Nidavellir", "Vanaheim"],
    correctIndex: 2,
  },
  {
    question: "In WandaVision, what does the acronym S.W.O.R.D. stand for?",
    options: [
      "Sentient World Observation and Response Department",
      "Special Weapons Observation and Reconnaissance Division",
      "Sentient Weapon Observation Response Division",
      "Strategic Worldwide Operations and Response Directorate",
    ],
    correctIndex: 2,
  },
  {
    question: "Which actress plays Agatha Harkness in WandaVision?",
    options: [
      "Elizabeth Olsen",
      "Teyonah Parris",
      "Kat Dennings",
      "Kathryn Hahn",
    ],
    correctIndex: 3,
  },
  {
    question:
      "The first episode of WandaVision is a sitcom pastiche set in which decade?",
    options: ["The 1950s", "The 1960s", "The 1970s", "The 1980s"],
    correctIndex: 0,
  },
  {
    question:
      "In the Disney+ series Loki, who is revealed to be the founder of the Time Variance Authority?",
    options: [
      "Ravonna Renslayer",
      "He Who Remains",
      "Miss Minutes",
      "Mobius M. Mobius",
    ],
    correctIndex: 1,
  },
  {
    question: "Who plays Kate Bishop in the Disney+ series Hawkeye?",
    options: [
      "Florence Pugh",
      "Hailee Steinfeld",
      "Iman Vellani",
      "Dominique Thorne",
    ],
    correctIndex: 1,
  },
  {
    question:
      "In Moon Knight, Marc Spector serves as the avatar of which Egyptian god?",
    options: ["Ammit", "Osiris", "Khonshu", "Taweret"],
    correctIndex: 2,
  },
  {
    question: "What species is Yondu, the blue-skinned Ravager captain?",
    options: ["Centaurian", "Xandarian", "Krylorian", "Zehoberei"],
    correctIndex: 0,
  },
  {
    question:
      "In Guardians of the Galaxy Vol. 2, Ego the Living Planet is which kind of ancient cosmic being?",
    options: ["An Eternal", "A Celestial", "A Titan", "A Kree"],
    correctIndex: 1,
  },
  {
    question: "What is Erik Killmonger's Wakandan birth name in Black Panther?",
    options: ["N'Jobu", "M'Baku", "N'Jadaka", "T'Chaka"],
    correctIndex: 2,
  },
  {
    question:
      "In Avengers: Endgame, which Avenger wears the Nano Gauntlet to bring back everyone Thanos snapped away?",
    options: ["Tony Stark", "Thor", "Steve Rogers", "Bruce Banner"],
    correctIndex: 3,
  },
  {
    question: "On which planet is the Soul Stone found in Avengers: Infinity War?",
    options: ["Vormir", "Morag", "Xandar", "Knowhere"],
    correctIndex: 0,
  },
  {
    question:
      "In Guardians of the Galaxy Vol. 3, which villain is revealed to have created Rocket?",
    options: [
      "Ego",
      "The Collector",
      "The Grandmaster",
      "The High Evolutionary",
    ],
    correctIndex: 3,
  },
  {
    question:
      "In WandaVision, which specific term is used for the kind of artificial being Vision is?",
    options: ["Android", "Synthezoid", "Cyborg", "Robot"],
    correctIndex: 1,
  },
  {
    question: "Wolverine made his first full comic-book appearance in which 1974 issue?",
    options: [
      "Giant-Size X-Men #1",
      "X-Men #1",
      "The Incredible Hulk #181",
      "The Amazing Spider-Man #129",
    ],
    correctIndex: 2,
  },
  {
    question: "Spider-Man made his comic-book debut in which 1962 issue?",
    options: [
      "Amazing Fantasy #15",
      "The Amazing Spider-Man #1",
      "Marvel Comics #1",
      "Strange Tales #1",
    ],
    correctIndex: 0,
  },
  {
    question:
      "Which was the first Marvel Cinematic Universe film to gross over $1 billion worldwide?",
    options: [
      "Iron Man 3",
      "The Avengers",
      "Iron Man 2",
      "Avengers: Age of Ultron",
    ],
    correctIndex: 1,
  },
  {
    question:
      "In The Falcon and the Winter Soldier, who is revealed to be the Power Broker?",
    options: [
      "Baron Zemo",
      "John Walker",
      "Valentina Allegra de Fontaine",
      "Sharon Carter",
    ],
    correctIndex: 3,
  },
];
