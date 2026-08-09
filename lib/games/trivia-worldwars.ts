/** Curated WWI and WWII questions. Ten are drawn at random per game. */
export const WORLD_WARS_QUESTIONS: {
  question: string;
  options: string[];
  correctIndex: number;
}[] = [
  // --- First World War ---
  {
    question:
      "In which city was Archduke Franz Ferdinand assassinated in June 1914, setting off the July Crisis?",
    options: ["Vienna", "Belgrade", "Sarajevo", "Zagreb"],
    correctIndex: 2,
  },
  {
    question:
      "Britain declared war on Germany in August 1914 after German troops invaded which neutral country?",
    options: ["Denmark", "Belgium", "The Netherlands", "Norway"],
    correctIndex: 1,
  },
  {
    question:
      "In which year did the widespread Christmas Truce see British and German troops meet in no man's land along many parts of the Western Front?",
    options: ["1914", "1915", "1916", "1917"],
    correctIndex: 0,
  },
  {
    question:
      "Which US president set out the Fourteen Points in January 1918, whose final point called for a general association of nations?",
    options: [
      "Theodore Roosevelt",
      "William Howard Taft",
      "Woodrow Wilson",
      "Warren G. Harding",
    ],
    correctIndex: 2,
  },
  {
    question:
      "In the Gallipoli campaign of 1915, Allied forces landed to fight the armies of which empire?",
    options: [
      "The Russian Empire",
      "Austria-Hungary",
      "The Kingdom of Bulgaria",
      "The Ottoman Empire",
    ],
    correctIndex: 3,
  },
  {
    question:
      "Lasting 302 days in 1916, which was the longest battle of the First World War?",
    options: ["The Somme", "Verdun", "Passchendaele", "Cambrai"],
    correctIndex: 1,
  },
  {
    question:
      "The first day of which 1916 battle remains the costliest single day in the history of the British Army?",
    options: ["Mons", "Loos", "Arras", "The Somme"],
    correctIndex: 3,
  },
  {
    question:
      "Fought in the North Sea in 1916, what was the largest naval battle of the First World War?",
    options: [
      "The Battle of Dogger Bank",
      "The Battle of Heligoland Bight",
      "The Battle of Jutland",
      "The Battle of Coronel",
    ],
    correctIndex: 2,
  },
  {
    question:
      "The 1917 Zimmermann Telegram offered German support to which country in reconquering Texas, New Mexico and Arizona?",
    options: ["Mexico", "Japan", "Spain", "Argentina"],
    correctIndex: 0,
  },
  {
    question:
      "The Treaty of Versailles was signed in June 1919 in which room of the Palace of Versailles?",
    options: [
      "The Hall of Mirrors",
      "The Salon of Apollo",
      "The Royal Chapel",
      "The Queen's Bedchamber",
    ],
    correctIndex: 0,
  },
  {
    question:
      "The Third Battle of Ypres, fought in Belgium in 1917 and notorious for its mud, is better known by what name?",
    options: ["Passchendaele", "Vimy Ridge", "Messines", "Neuve Chapelle"],
    correctIndex: 0,
  },
  {
    question:
      "Tanks were used in battle for the first time in September 1916, during which engagement of the Somme offensive?",
    options: [
      "Delville Wood",
      "Flers-Courcelette",
      "Thiepval Ridge",
      "Pozieres",
    ],
    correctIndex: 1,
  },
  {
    question:
      "Which gas did Germany release at the Second Battle of Ypres in April 1915, the first large-scale lethal gas attack on the Western Front?",
    options: ["Chlorine", "Mustard gas", "Phosgene", "Chloropicrin"],
    correctIndex: 0,
  },
  {
    question:
      "The armistice that ended the fighting on 11 November 1918 was signed in a railway carriage in which French forest?",
    options: ["The Argonne", "Fontainebleau", "The Ardennes", "Compiegne"],
    correctIndex: 3,
  },
  {
    question:
      "Which treaty, signed in March 1918, ended Soviet Russia's participation in the First World War?",
    options: [
      "The Treaty of Bucharest",
      "The Treaty of Brest-Litovsk",
      "The Treaty of Trianon",
      "The Treaty of Sevres",
    ],
    correctIndex: 1,
  },

  // --- Second World War ---
  {
    question:
      "Britain and France declared war on Germany on 3 September 1939, two days after the German invasion of which country?",
    options: ["Czechoslovakia", "Poland", "Belgium", "Norway"],
    correctIndex: 1,
  },
  {
    question: "Pearl Harbor, attacked on 7 December 1941, is on which Hawaiian island?",
    options: ["Maui", "Oahu", "Hawaii (the Big Island)", "Kauai"],
    correctIndex: 1,
  },
  {
    question:
      "Who served as Supreme Commander of the Allied Expeditionary Force that carried out the D-Day landings?",
    options: [
      "Bernard Montgomery",
      "George S. Patton",
      "Dwight D. Eisenhower",
      "Omar Bradley",
    ],
    correctIndex: 2,
  },
  {
    question:
      "V-E Day, marking the Allies' formal acceptance of Germany's unconditional surrender, is commemorated in Britain and the United States on which date?",
    options: ["8 May 1945", "2 September 1945", "6 June 1944", "30 April 1945"],
    correctIndex: 0,
  },
  {
    question: "On the American home front, Rosie the Riveter became the symbol of what?",
    options: [
      "Rationing of household goods",
      "War bond drives",
      "Victory gardens",
      "Women working in factories and shipyards",
    ],
    correctIndex: 3,
  },
  {
    question: "Operation Barbarossa, launched in June 1941, was the German invasion of what?",
    options: ["The Soviet Union", "Britain", "Norway", "Greece"],
    correctIndex: 0,
  },
  {
    question:
      "What was the code name for the 1940 evacuation of Allied troops from the beaches of Dunkirk?",
    options: [
      "Operation Sea Lion",
      "Operation Torch",
      "Operation Jubilee",
      "Operation Dynamo",
    ],
    correctIndex: 3,
  },
  {
    question: "How many Japanese fleet carriers were sunk at the Battle of Midway in June 1942?",
    options: ["One", "Two", "Four", "Six"],
    correctIndex: 2,
  },
  {
    question: "The city that was Stalingrad during the war is known today by what name?",
    options: ["Yekaterinburg", "Nizhny Novgorod", "Samara", "Volgograd"],
    correctIndex: 3,
  },
  {
    question:
      "Which British general commanded the Eighth Army to victory at the Second Battle of El Alamein in 1942?",
    options: [
      "Harold Alexander",
      "Claude Auchinleck",
      "Bernard Montgomery",
      "Archibald Wavell",
    ],
    correctIndex: 2,
  },
  {
    question:
      "The Japanese Instrument of Surrender was signed on 2 September 1945 aboard which ship in Tokyo Bay?",
    options: ["USS Arizona", "USS Enterprise", "USS Iowa", "USS Missouri"],
    correctIndex: 3,
  },
  {
    question:
      "The Auschwitz camp complex was liberated on 27 January 1945, now International Holocaust Remembrance Day, by soldiers of which army?",
    options: [
      "The US Army",
      "The British Army",
      "The Soviet Red Army",
      "The Polish Home Army",
    ],
    correctIndex: 2,
  },
  {
    question:
      "Encircled at Bastogne in December 1944, US Brigadier General Anthony McAuliffe answered a German surrender demand with which single word?",
    options: ["Never", "Nuts", "Surrender", "Nein"],
    correctIndex: 1,
  },
  {
    question:
      "Operation Market Garden in September 1944 failed to secure the Rhine bridge at which Dutch town?",
    options: ["Nijmegen", "Eindhoven", "Arnhem", "Grave"],
    correctIndex: 2,
  },
  {
    question:
      "Which country's cryptanalysts first broke the German Enigma cipher in 1932 and handed their methods to Britain and France in 1939?",
    options: ["France", "Poland", "Czechoslovakia", "Norway"],
    correctIndex: 1,
  },
];
