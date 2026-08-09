/** Curated anime questions (major titles only). Ten are drawn at random per game. */
export const ANIME_QUESTIONS: {
  question: string;
  options: string[];
  correctIndex: number;
}[] = [
  {
    question:
      "Which member of the Straw Hat crew in One Piece fights with three swords at once?",
    options: ["Roronoa Zoro", "Sanji", "Usopp", "Brook"],
    correctIndex: 0,
  },
  {
    question:
      "What was the name of the Straw Hat Pirates' first ship, the one replaced by the Thousand Sunny?",
    options: ["Red Force", "Oro Jackson", "Baratie", "Going Merry"],
    correctIndex: 3,
  },
  {
    question: "Which tailed beast is sealed inside Naruto Uzumaki?",
    options: [
      "The One-Tailed Shukaku",
      "The Nine-Tailed Fox",
      "The Three-Tailed Isobu",
      "The Eight-Tailed Gyuki",
    ],
    correctIndex: 1,
  },
  {
    question:
      "Who was the Fourth Hokage, the man who sealed the Nine-Tails inside his newborn son Naruto?",
    options: ["Hiruzen Sarutobi", "Jiraiya", "Minato Namikaze", "Hashirama Senju"],
    correctIndex: 2,
  },
  {
    question: "Kakashi Hatake's Sharingan eye was transplanted from which of his teammates?",
    options: ["Itachi Uchiha", "Shisui Uchiha", "Madara Uchiha", "Obito Uchiha"],
    correctIndex: 3,
  },
  {
    question: "How many Dragon Balls must be gathered to summon the wish-granting dragon?",
    options: ["Three", "Five", "Seven", "Nine"],
    correctIndex: 2,
  },
  {
    question:
      "Goku became the first Saiyan in a thousand years to turn Super Saiyan during his battle against which villain?",
    options: ["Frieza", "Cell", "Vegeta", "Majin Buu"],
    correctIndex: 0,
  },
  {
    question:
      "In Attack on Titan, which of the three walls is the outermost, and the first to be breached in year 845?",
    options: ["Wall Sina", "Wall Maria", "Wall Rose", "Wall Paradis"],
    correctIndex: 1,
  },
  {
    question:
      "Which branch of the military in Attack on Titan mounts expeditions beyond the walls?",
    options: [
      "The Garrison",
      "The Military Police Brigade",
      "The Survey Corps",
      "The Training Corps",
    ],
    correctIndex: 2,
  },
  {
    question:
      "In Demon Slayer, what is the name of Tanjiro Kamado's sister, who is turned into a demon?",
    options: ["Nezuko", "Kanao", "Shinobu", "Mitsuri"],
    correctIndex: 0,
  },
  {
    question:
      "Who is the progenitor of all demons in Demon Slayer, and the one responsible for slaughtering Tanjiro's family?",
    options: ["Kokushibo", "Muzan Kibutsuji", "Akaza", "Enmu"],
    correctIndex: 1,
  },
  {
    question: "Which Breathing Style does Zenitsu Agatsuma use in Demon Slayer?",
    options: [
      "Flame Breathing",
      "Mist Breathing",
      "Sound Breathing",
      "Thunder Breathing",
    ],
    correctIndex: 3,
  },
  {
    question:
      "In Jujutsu Kaisen, Yuji Itadori becomes the host of which curse after swallowing one of its fingers?",
    options: ["Mahito", "Jogo", "Ryomen Sukuna", "Kenjaku"],
    correctIndex: 2,
  },
  {
    question:
      "What is the name of the cursed technique Satoru Gojo inherited from his clan?",
    options: ["Limitless", "Ten Shadows Technique", "Boogie Woogie", "Cursed Speech"],
    correctIndex: 0,
  },
  {
    question: "Which shinigami drops the Death Note into the human world out of boredom?",
    options: ["Rem", "Sidoh", "Ryuk", "Gelus"],
    correctIndex: 2,
  },
  {
    question:
      "After a name is written in the Death Note, how long does the writer have to specify a cause of death?",
    options: ["10 seconds", "40 seconds", "2 minutes", "6 minutes and 40 seconds"],
    correctIndex: 1,
  },
  {
    question: "Izuku Midoriya trains to be a hero at which school in My Hero Academia?",
    options: [
      "Shiketsu High School",
      "Ketsubutsu Academy",
      "Isamu Academy",
      "U.A. High School",
    ],
    correctIndex: 3,
  },
  {
    question: "What is All Might's real name?",
    options: ["Toshinori Yagi", "Enji Todoroki", "Keigo Takami", "Shota Aizawa"],
    correctIndex: 0,
  },
  {
    question:
      "Edward Elric gave up his right arm to bind Alphonse's soul to a suit of armor. Which limb had the failed human transmutation already taken from him?",
    options: ["His left arm", "His left leg", "His right leg", "Both of his legs"],
    correctIndex: 1,
  },
  {
    question: "In the Pokémon anime, what is the name of Ash Ketchum's hometown?",
    options: ["Viridian City", "Cerulean City", "Pallet Town", "Vermilion City"],
    correctIndex: 2,
  },
  {
    question:
      "Which Pokémon in Team Rocket's trio taught itself to speak human language?",
    options: ["Meowth", "Wobbuffet", "Koffing", "Ekans"],
    correctIndex: 0,
  },
  {
    question: "In Spirited Away, what new name does the witch Yubaba force on Chihiro?",
    options: ["Chiyo", "Rin", "Haku", "Sen"],
    correctIndex: 3,
  },
  {
    question: "The Catbus appears in which Studio Ghibli film?",
    options: [
      "Kiki's Delivery Service",
      "Ponyo",
      "Howl's Moving Castle",
      "My Neighbor Totoro",
    ],
    correctIndex: 3,
  },
  {
    question: "In Princess Mononoke, what is the name of the girl raised by wolves?",
    options: ["San", "Eboshi", "Ashitaka", "Toki"],
    correctIndex: 0,
  },
  {
    question: "Who wrote and directed the 2016 film Your Name?",
    options: ["Hayao Miyazaki", "Mamoru Hosoda", "Makoto Shinkai", "Satoshi Kon"],
    correctIndex: 2,
  },
  {
    question: "What is the aura-based power system in Hunter x Hunter called?",
    options: ["Chakra", "Nen", "Ki", "Haki"],
    correctIndex: 1,
  },
  {
    question: "What is the name of the Welsh Corgi who joins the crew of the Bebop?",
    options: ["Pochita", "Akamaru", "Zwei", "Ein"],
    correctIndex: 3,
  },
  {
    question: "In Neon Genesis Evangelion, which Evangelion does Shinji Ikari pilot?",
    options: ["Unit-00", "Unit-01", "Unit-02", "Unit-03"],
    correctIndex: 1,
  },
  {
    question:
      "Saitama credits his power in One-Punch Man to a daily routine of 100 push-ups, 100 sit-ups, 100 squats and what else?",
    options: [
      "A 10 km run",
      "An ice bath",
      "A 5 km swim",
      "Two hours of meditation",
    ],
    correctIndex: 0,
  },
  {
    question: "Which talking cat reveals to Usagi Tsukino that she is Sailor Moon?",
    options: ["Artemis", "Luna", "Diana", "Kuro"],
    correctIndex: 1,
  },
];
