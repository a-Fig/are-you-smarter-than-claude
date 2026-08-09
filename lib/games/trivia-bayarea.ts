/**
 * Curated San Francisco Bay Area questions. The Open Trivia Database has no
 * local category, so this static set stands in for one. Ten are drawn at
 * random per game.
 */
export const BAY_AREA_QUESTIONS: {
  question: string;
  options: string[];
  correctIndex: number;
}[] = [
  {
    question: "In what year did the Golden Gate Bridge open to traffic?",
    options: ["1927", "1933", "1937", "1941"],
    correctIndex: 2,
  },
  {
    question: "What is the official name of the color of the Golden Gate Bridge?",
    options: ["Sunset Red", "International Orange", "Golden Ochre", "Presidio Rust"],
    correctIndex: 1,
  },
  {
    question: "In what year did Alcatraz shut down as a federal penitentiary?",
    options: ["1946", "1955", "1963", "1972"],
    correctIndex: 2,
  },
  {
    question:
      "From 1969 to 1971, Alcatraz Island was occupied for 19 months by which group?",
    options: [
      "Native American activists",
      "Anti-war student protesters",
      "Striking dockworkers",
      "Escaped inmates",
    ],
    correctIndex: 0,
  },
  {
    question:
      "Most of the destruction in San Francisco's 1906 disaster came from what, rather than the shaking itself?",
    options: ["Fires", "A tsunami", "Landslides", "Flooding"],
    correctIndex: 0,
  },
  {
    question: "What was San Francisco called before it was renamed in 1847?",
    options: ["Presidio", "Monterey", "Yerba Buena", "Nueva Alta"],
    correctIndex: 2,
  },
  {
    question: "The charter of the United Nations was signed in San Francisco in what year?",
    options: ["1919", "1938", "1945", "1951"],
    correctIndex: 2,
  },
  {
    question:
      "The 1989 Loma Prieta earthquake struck minutes before a game in which sporting event?",
    options: ["The Super Bowl", "The World Series", "The NBA Finals", "The US Open"],
    correctIndex: 1,
  },
  {
    question:
      "Harvey Milk, one of the first openly gay elected officials in the US, won a seat on which body in 1977?",
    options: [
      "The California State Senate",
      "The San Francisco Board of Supervisors",
      "The US House of Representatives",
      "The San Francisco Board of Education",
    ],
    correctIndex: 1,
  },
  {
    question:
      "Which San Francisco street is famous for its one-block stretch of eight hairpin turns?",
    options: ["Filbert Street", "Divisadero Street", "Vallejo Street", "Lombard Street"],
    correctIndex: 3,
  },
  {
    question:
      "Andrew Hallidie's cable car line, the first in San Francisco, opened in 1873 along which street?",
    options: ["Powell Street", "Clay Street", "Market Street", "California Street"],
    correctIndex: 1,
  },
  {
    question: "Coit Tower stands on top of which San Francisco hill?",
    options: ["Nob Hill", "Russian Hill", "Telegraph Hill", "Potrero Hill"],
    correctIndex: 2,
  },
  {
    question: "What is the highest natural point within San Francisco city limits?",
    options: ["Twin Peaks", "Mount Davidson", "Nob Hill", "Bernal Heights"],
    correctIndex: 1,
  },
  {
    question: "What is the tallest building in San Francisco?",
    options: [
      "Transamerica Pyramid",
      "555 California Street",
      "Salesforce Tower",
      "Millennium Tower",
    ],
    correctIndex: 2,
  },
  {
    question:
      "Which island in San Francisco Bay held an immigration station known as the 'Ellis Island of the West'?",
    options: ["Treasure Island", "Angel Island", "Yerba Buena Island", "Alcatraz Island"],
    correctIndex: 1,
  },
  {
    question: "The Winchester Mystery House is located in which Bay Area city?",
    options: ["San Mateo", "Santa Cruz", "Sausalito", "San Jose"],
    correctIndex: 3,
  },
  {
    question: "Levi's Stadium, home of the San Francisco 49ers, is in which city?",
    options: ["San Jose", "Santa Clara", "Redwood City", "Fremont"],
    correctIndex: 1,
  },
  {
    question: "How many Super Bowls have the San Francisco 49ers won?",
    options: ["Three", "Four", "Five", "Six"],
    correctIndex: 2,
  },
  {
    question: "What is the current name of the San Francisco Giants' waterfront ballpark?",
    options: ["Oracle Park", "Chase Center", "Candlestick Park", "PacBell Field"],
    correctIndex: 0,
  },
  {
    question: "The Giants moved to San Francisco in 1958 from which city?",
    options: ["Boston", "Brooklyn", "New York", "Philadelphia"],
    correctIndex: 2,
  },
  {
    question: "Which team won three consecutive World Series in 1972, 1973 and 1974?",
    options: [
      "The San Francisco Giants",
      "The Oakland Athletics",
      "The San Francisco Seals",
      "The San Jose Bees",
    ],
    correctIndex: 1,
  },
  {
    question: "Apple is headquartered in which Silicon Valley city?",
    options: ["Mountain View", "Palo Alto", "Cupertino", "Sunnyvale"],
    correctIndex: 2,
  },
  {
    question: "Meta (formerly Facebook) has its headquarters in which Bay Area city?",
    options: ["Menlo Park", "Palo Alto", "Fremont", "Milpitas"],
    correctIndex: 0,
  },
  {
    question:
      "The Hewlett-Packard garage, designated the 'Birthplace of Silicon Valley', is in which city?",
    options: ["San Jose", "Palo Alto", "Berkeley", "Los Altos"],
    correctIndex: 1,
  },
  {
    question: "In what year did BART carry its first passengers?",
    options: ["1962", "1972", "1980", "1989"],
    correctIndex: 1,
  },
  {
    question:
      "Which San Francisco bar is credited with popularizing Irish coffee in the United States in 1952?",
    options: ["Tosca Cafe", "The Buena Vista Cafe", "Vesuvio", "The Tonga Room"],
    correctIndex: 1,
  },
  {
    question:
      "Which animals have been kept continuously in a Golden Gate Park paddock since 1891?",
    options: ["Zebras", "Bison", "Alpacas", "Ostriches"],
    correctIndex: 1,
  },
  {
    question: "Muir Woods National Monument protects an old-growth grove of which trees?",
    options: ["Giant sequoias", "Coast redwoods", "Douglas firs", "Bristlecone pines"],
    correctIndex: 1,
  },
  {
    question: "Which San Francisco neighborhood was the epicenter of 1967's Summer of Love?",
    options: ["North Beach", "The Mission", "Haight-Ashbury", "The Castro"],
    correctIndex: 2,
  },
  {
    question:
      "Which North Beach bookstore, co-founded by Lawrence Ferlinghetti in 1953, became a hub of the Beat movement?",
    options: ["City Lights", "Green Apple Books", "The Booksmith", "Dog Eared Books"],
    correctIndex: 0,
  },
];
