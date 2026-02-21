/*
  NeymarGPT Offline NLU Engine
  - Pure browser JavaScript
  - No APIs, no frameworks
  - Data-driven intent routing
*/

const neymarData = {
  fullName: "Neymar da Silva Santos Junior",
  nicknames: ["Ney", "Neymar Jr.", "Menino Ney"],
  birth: {
    isoDate: "1992-02-05",
    date: "5 February 1992",
    place: "Mogi das Cruzes, Sao Paulo, Brazil"
  },
  nationality: "Brazilian",
  height: "1.75 m (5 ft 9 in)",
  preferredFoot: "Right",
  positions: ["Left Winger", "Forward", "Attacking Midfielder"],
  currentClub: "Santos FC",
  currentStatus: "Returned to Santos in 2024.",
  socialMedia: {
    instagram: "https://instagram.com/neymarjr",
    twitter: "https://twitter.com/neymarjr"
  },
  clubCareer: [
    {
      club: "Santos FC",
      years: "2009-2013",
      appearances: 225,
      goals: 136
    },
    {
      club: "FC Barcelona",
      years: "2013-2017",
      appearances: 186,
      goals: 105
    },
    {
      club: "Paris Saint-Germain",
      years: "2017-2023",
      appearances: 173,
      goals: 118
    },
    {
      club: "Al-Hilal",
      years: "2023-2024",
      appearances: 5,
      goals: 1
    },
    {
      club: "Santos FC",
      years: "2024-Present",
      appearances: 12,
      goals: 4
    }
  ],
  nationalTeam: {
    team: "Brazil",
    caps: 128,
    goals: 79,
    debut: "10 August 2010 vs USA"
  },
  trophies: {
    club: [
      "UEFA Champions League (2014-15)",
      "Copa Libertadores (2011)",
      "La Liga (2014-15, 2015-16)",
      "Ligue 1 (multiple titles)"
    ],
    international: [
      "Olympic Gold Medal (2016)",
      "FIFA Confederations Cup (2013)"
    ],
    individual: [
      "FIFA Puskas Award (2011)",
      "South American Footballer of the Year (2011, 2012)"
    ]
  },
  playStyle: {
    traits: ["dribbling", "flair", "vision", "playmaking", "agility"],
    strengths: [
      "close control",
      "1v1 attacking",
      "chance creation",
      "quick acceleration"
    ],
    summary:
      "Neymar plays with elite dribbling, creativity, and direct one-v-one attacking flair."
  },
  injuries: [
    { year: 2014, brief: "Fractured vertebra at the World Cup." },
    { year: 2018, brief: "Fractured fifth metatarsal." },
    { year: 2019, brief: "Right ankle sprain." },
    { year: 2021, brief: "Left ankle ligament damage." },
    { year: 2023, brief: "ACL and meniscus injury with Brazil." }
  ],
  family: {
    father: "Neymar Santos Sr.",
    son: "Davi Lucca"
  },
  quotes: [
    "I am not a superstar. I am a football player who wants to improve every day.",
    "My ambition is always to win and enjoy football.",
    "Pressure is part of football. I focus on helping my team."
  ],
  funFacts: [
    "He won Olympic Gold with Brazil in Rio 2016.",
    "He formed the famous MSN trio at Barcelona.",
    "He became a global star at a very young age."
  ]
};

const NON_NEYMAR_GUARD_REPLY =
  "Sorry, I only answer questions about Neymar Jr. 😅 Try asking about his clubs, Brazil goals, trophies, or injuries.";
const UNKNOWN_FALLBACK_REPLY =
  "Sorry, I only answer questions about Neymar Jr.";
const MISSING_DETAIL_REPLY =
  "I don’t have that exact detail in my offline database yet — want the clubs, trophies, or Brazil stats instead?";

const IMPORTANT_SPELL_KEYWORDS = [
  "neymar",
  "santos",
  "barcelona",
  "psg",
  "brazil",
  "trophies",
  "ucl",
  "injury",
  "quotes",
  "family"
];

const OTHER_PLAYERS = [
  "messi",
  "ronaldo",
  "mbappe",
  "haaland",
  "vinicius",
  "modric"
];

const UNRELATED_TOPICS = [
  "politics",
  "president",
  "movie",
  "series",
  "recipe",
  "weather",
  "bitcoin",
  "crypto",
  "stock",
  "programming",
  "javascript",
  "python"
];

const CLUB_ALIASES = {
  santos: ["santos", "santos fc"],
  barcelona: ["barcelona", "barca", "fc barcelona"],
  psg: ["psg", "paris saint germain", "paris"],
  al_hilal: ["al hilal", "al-hilal", "alhilal", "hilal"]
};

const TROPHY_TERMS = [
  "ucl",
  "champions league",
  "copa libertadores",
  "olympic gold",
  "confederations cup",
  "la liga",
  "ligue 1",
  "puskas"
];

const INTENT_REGISTRY = [
  {
    id: "bio.basic",
    description: "Basic personal profile",
    patterns: [
      /\b(full name|real name|born|birthday|birth date|birth place)\b/i,
      /\b(nationality|height|position|preferred foot|foot)\b/i
    ],
    keywords: ["bio", "full name", "born", "nationality", "height", "position", "foot"],
    synonyms: ["who is neymar", "date of birth", "how tall"],
    negative_keywords: ["trophies", "injury", "quote"],
    examples: [
      "When was Neymar born?",
      "What is Neymar full name?",
      "What position does he play?"
    ],
    responseFn: respondBioBasic
  },
  {
    id: "career.clubs",
    description: "Club timeline and current club",
    patterns: [
      /\b(club|clubs|team|teams|timeline|career)\b/i,
      /\b(current club|plays for now)\b/i
    ],
    keywords: ["clubs", "club", "teams", "timeline", "career", "current club", "santos", "barcelona", "psg"],
    synonyms: ["sides", "career path", "where has he played"],
    negative_keywords: ["caps", "debut", "quote"],
    examples: [
      "What clubs has Neymar played for?",
      "What is his current club?"
    ],
    responseFn: respondCareerClubs
  },
  {
    id: "career.club_stats",
    description: "Club appearances/goals",
    patterns: [
      /\b(club stats|stats by club|apps|appearances|goals at)\b/i,
      /\b(how many goals .*barcelona|how many goals .*psg|santos stats)\b/i
    ],
    keywords: ["stats", "apps", "appearances", "goals", "club stats", "barcelona", "psg", "santos", "al hilal"],
    synonyms: ["numbers", "record by club", "scoring at"],
    negative_keywords: ["trophies", "injury", "quote"],
    examples: [
      "How many goals did he score at Barcelona?",
      "Give me Neymar club stats."
    ],
    responseFn: respondCareerClubStats
  },
  {
    id: "national.team",
    description: "Brazil national team record",
    patterns: [
      /\b(brazil|selecao|national team)\b/i,
      /\b(caps|goals|debut|world cup)\b/i
    ],
    keywords: ["brazil", "selecao", "caps", "goals", "debut", "national team", "world cup"],
    synonyms: ["international record", "brazil stats"],
    negative_keywords: ["clubs", "quote"],
    examples: [
      "How many Brazil goals does Neymar have?",
      "When was his Brazil debut?"
    ],
    responseFn: respondNationalTeam
  },
  {
    id: "honours.trophies",
    description: "Trophies and honours",
    patterns: [
      /\b(trophy|trophies|title|titles|honours|awards)\b/i,
      /\b(what has he won|major honours)\b/i
    ],
    keywords: ["trophies", "titles", "honours", "awards", "won", "ucl", "libertadores"],
    synonyms: ["silverware", "achievements"],
    negative_keywords: ["injury", "family"],
    examples: [
      "What trophies has Neymar won?",
      "Tell me his major honours."
    ],
    responseFn: respondHonoursTrophies
  },
  {
    id: "playstyle",
    description: "Playing style and strengths",
    patterns: [
      /\b(playstyle|playing style|style of play)\b/i,
      /\b(traits|strengths|dribbling|flair)\b/i
    ],
    keywords: ["playstyle", "style", "traits", "strengths", "dribbling", "flair", "vision"],
    synonyms: ["how he plays", "type of player"],
    negative_keywords: ["trophies", "debut"],
    examples: [
      "What is Neymar play style?",
      "What are his strengths?"
    ],
    responseFn: respondPlaystyle
  },
  {
    id: "injuries",
    description: "Injury history",
    patterns: [
      /\b(injury|injuries|injured|acl|recovery)\b/i
    ],
    keywords: ["injury", "injuries", "injured", "acl", "recovery", "ankle"],
    synonyms: ["fitness issues", "major knocks"],
    negative_keywords: ["trophies", "quote"],
    examples: [
      "What injuries has Neymar had?",
      "Tell me about his ACL injury."
    ],
    responseFn: respondInjuries
  },
  {
    id: "family",
    description: "Father and son details",
    patterns: [
      /\b(family|father|son|davi)\b/i
    ],
    keywords: ["family", "father", "son", "davi"],
    synonyms: ["parents", "child"],
    negative_keywords: ["trophies", "debut"],
    examples: [
      "Who is Neymar father?",
      "Does Neymar have a son?"
    ],
    responseFn: respondFamily
  },
  {
    id: "quotes",
    description: "Neymar quotes",
    patterns: [
      /\b(quote|quotes|what did neymar say|saying)\b/i
    ],
    keywords: ["quote", "quotes", "said", "saying"],
    synonyms: ["famous line", "statement"],
    negative_keywords: ["injury", "stats"],
    examples: [
      "Give me a Neymar quote.",
      "What did he say about pressure?"
    ],
    responseFn: respondQuotes
  },
  {
    id: "funfacts",
    description: "Fun trivia",
    patterns: [
      /\b(fun fact|fun facts|trivia|interesting facts)\b/i
    ],
    keywords: ["fun", "fact", "facts", "trivia", "interesting"],
    synonyms: ["cool facts"],
    negative_keywords: ["injury", "debut"],
    examples: [
      "Tell me Neymar fun facts."
    ],
    responseFn: respondFunFacts
  },
  {
    id: "social",
    description: "Social media handles",
    patterns: [
      /\b(instagram|twitter|social media|account)\b/i
    ],
    keywords: ["instagram", "twitter", "social", "accounts"],
    synonyms: ["follow", "handle"],
    negative_keywords: ["injury", "trophies"],
    examples: [
      "What is Neymar Instagram?",
      "Share his social media."
    ],
    responseFn: respondSocial
  },
  {
    id: "help",
    description: "Help menu",
    patterns: [
      /\b(help|what can i ask|options|menu)\b/i
    ],
    keywords: ["help", "options", "menu", "ask"],
    synonyms: ["commands", "topics"],
    negative_keywords: [],
    examples: ["Help"],
    responseFn: respondHelp
  },
  {
    id: "unknown",
    description: "Fallback unknown",
    patterns: [],
    keywords: [],
    synonyms: [],
    negative_keywords: [],
    examples: [],
    responseFn: respondUnknown
  },
  {
    id: "non_neymar_guard",
    description: "Reject unrelated topics",
    patterns: [],
    keywords: [],
    synonyms: [],
    negative_keywords: [],
    examples: [],
    responseFn: respondNonNeymarGuard
  }
];

function normalize(text) {
  return String(text || "")
    .replace(/[’‘`]/g, "'")
    .toLowerCase()
    .replace(/[^a-z0-9\s']/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenize(text) {
  const tokens = text ? text.split(" ").filter(Boolean) : [];
  const bigrams = buildNgrams(tokens, 2);
  const trigrams = buildNgrams(tokens, 3);
  return {
    tokens,
    bigrams,
    trigrams,
    allTerms: [...tokens, ...bigrams, ...trigrams]
  };
}

function buildNgrams(tokens, size) {
  const grams = [];
  for (let i = 0; i <= tokens.length - size; i += 1) {
    grams.push(tokens.slice(i, i + size).join(" "));
  }
  return grams;
}

function editDistance(a, b, maxDistance) {
  if (a === b) {
    return 0;
  }
  if (Math.abs(a.length - b.length) > maxDistance) {
    return maxDistance + 1;
  }

  const rows = a.length + 1;
  const cols = b.length + 1;
  const dp = Array.from({ length: rows }, () => Array(cols).fill(0));

  for (let i = 0; i < rows; i += 1) {
    dp[i][0] = i;
  }
  for (let j = 0; j < cols; j += 1) {
    dp[0][j] = j;
  }

  for (let i = 1; i < rows; i += 1) {
    let minInRow = Number.POSITIVE_INFINITY;
    for (let j = 1; j < cols; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost
      );
      if (dp[i][j] < minInRow) {
        minInRow = dp[i][j];
      }
    }
    if (minInRow > maxDistance) {
      return maxDistance + 1;
    }
  }

  return dp[a.length][b.length];
}

function spellFixLite(text) {
  const tokens = text.split(" ").filter(Boolean);
  const fixed = tokens.map((token) => {
    if (/^\d+$/.test(token) || token.length < 3) {
      return token;
    }
    if (IMPORTANT_SPELL_KEYWORDS.includes(token)) {
      return token;
    }

    let best = token;
    let bestDistance = Number.POSITIVE_INFINITY;
    for (const keyword of IMPORTANT_SPELL_KEYWORDS) {
      const maxDist = keyword.length >= 7 ? 2 : 1;
      const dist = editDistance(token, keyword, maxDist);
      if (dist <= maxDist && dist < bestDistance) {
        best = keyword;
        bestDistance = dist;
      }
    }
    return best;
  });

  return fixed.join(" ");
}

function extractEntities(text) {
  const tokenData = tokenize(text);
  const termSet = new Set(tokenData.allTerms);

  const clubs = [];
  for (const [clubKey, aliases] of Object.entries(CLUB_ALIASES)) {
    if (aliases.some((alias) => termSet.has(normalize(alias)) || text.includes(normalize(alias)))) {
      clubs.push(clubKey);
    }
  }

  const years = Array.from(new Set((text.match(/\b(19|20)\d{2}\b/g) || [])));
  const trophies = TROPHY_TERMS.filter((term) => termSet.has(term) || text.includes(term));
  const competitions = ["world cup", "ucl", "champions league"].filter(
    (term) => termSet.has(term) || text.includes(term)
  );
  const countries = ["brazil"].filter((term) => termSet.has(term));
  const familyTerms = ["father", "son", "davi"].filter((term) => termSet.has(term));
  const injuryTerms = ["injury", "injuries", "injured", "acl", "recovery"].filter(
    (term) => termSet.has(term)
  );

  const otherPeople = OTHER_PLAYERS.filter(
    (name) => termSet.has(name) || text.includes(name)
  );
  const unrelatedTopics = UNRELATED_TOPICS.filter(
    (term) => termSet.has(term) || text.includes(term)
  );

  const hasNeymarReference =
    termSet.has("neymar") ||
    termSet.has("neymar jr") ||
    termSet.has("jr") ||
    termSet.has("njr") ||
    termSet.has("davi");

  return {
    clubs,
    years,
    trophies,
    competitions,
    countries,
    familyTerms,
    injuryTerms,
    otherPeople,
    unrelatedTopics,
    hasNeymarReference
  };
}

function detectIntents(userText) {
  const normalizedText = normalize(userText);
  const correctedText = spellFixLite(normalizedText);
  const tokenData = tokenize(correctedText);
  const entities = extractEntities(correctedText);

  const guardTriggered =
    (entities.otherPeople.length > 0 || entities.unrelatedTopics.length > 0) &&
    !entities.hasNeymarReference;

  if (guardTriggered) {
    return {
      normalizedText,
      correctedText,
      tokenData,
      entities,
      guardTriggered: true,
      rankedIntents: [
        {
          intent: getIntentById("non_neymar_guard"),
          score: 1
        }
      ]
    };
  }

  const scored = INTENT_REGISTRY
    .filter((intent) => intent.id !== "unknown" && intent.id !== "non_neymar_guard")
    .map((intent) => ({
      intent,
      score: scoreIntent(intent, correctedText, tokenData, entities)
    }))
    .sort((a, b) => b.score - a.score);

  return {
    normalizedText,
    correctedText,
    tokenData,
    entities,
    guardTriggered: false,
    rankedIntents: scored
  };
}

function scoreIntent(intent, text, tokenData, entities) {
  const allTerms = new Set(tokenData.allTerms);
  const signalTerms = [...intent.keywords, ...intent.synonyms].map((t) => normalize(t));

  const keywordHits = countTermHits(allTerms, signalTerms);
  const patternHits = intent.patterns.reduce(
    (count, pattern) => count + (pattern.test(text) ? 1 : 0),
    0
  );
  const entityHits = countEntityMatches(intent.id, entities);
  const negativeHits = countTermHits(allTerms, intent.negative_keywords.map((t) => normalize(t)));

  const patternScore = intent.patterns.length
    ? Math.min(1, patternHits / intent.patterns.length)
    : 0;
  const keywordScore = signalTerms.length
    ? Math.min(1, keywordHits / Math.max(1, Math.ceil(signalTerms.length * 0.35)))
    : 0;
  const entityScore = Math.min(1, entityHits / 2);

  let score = patternScore * 0.45 + keywordScore * 0.35 + entityScore * 0.2;

  // Boost when both lexical and pattern signals agree.
  if (patternHits > 0 && keywordHits > 0) {
    score += 0.2;
  }

  // Small boost when Neymar is explicitly referenced.
  if (entities.hasNeymarReference && intent.id !== "help") {
    score += 0.08;
  }

  score -= negativeHits * 0.18;

  if (intent.id === "help" && /\b(help|what can i ask|menu|options)\b/.test(text)) {
    score = Math.max(score, 0.9);
  }

  return Math.max(0, Math.min(1, score));
}

function countTermHits(termSet, terms) {
  let hits = 0;
  for (const term of terms) {
    if (!term) {
      continue;
    }
    if (termSet.has(term)) {
      hits += 1;
      continue;
    }

    if (!term.includes(" ")) {
      for (const existing of termSet) {
        if (existing.includes(" ")) {
          continue;
        }
        const maxDist = term.length >= 7 ? 2 : 1;
        if (editDistance(existing, term, maxDist) <= maxDist) {
          hits += 1;
          break;
        }
      }
    }
  }
  return hits;
}

function countEntityMatches(intentId, entities) {
  switch (intentId) {
    case "career.clubs":
    case "career.club_stats":
      return entities.clubs.length;
    case "national.team":
      return entities.countries.length + entities.competitions.length;
    case "honours.trophies":
      return entities.trophies.length;
    case "injuries":
      return entities.injuryTerms.length + entities.years.length;
    case "family":
      return entities.familyTerms.length;
    default:
      return 0;
  }
}

function route(intentChoice, entities, nluContext) {
  if (!intentChoice || !intentChoice.intent) {
    return respondUnknown();
  }
  return intentChoice.intent.responseFn({
    entities,
    text: nluContext.correctedText
  });
}

function renderResponse(response) {
  const message = typeof response === "string" ? response : UNKNOWN_FALLBACK_REPLY;
  return message.trim();
}

function getBotReply(userText) {
  const nlu = detectIntents(userText);
  if (nlu.guardTriggered) {
    return renderResponse(respondNonNeymarGuard());
  }

  const [top, second] = nlu.rankedIntents;
  if (!top) {
    return renderResponse(respondUnknown());
  }

  if (top.score < 0.45) {
    const helpCandidate = nlu.rankedIntents.find((item) => item.intent.id === "help");
    if (helpCandidate && helpCandidate.score >= 0.4) {
      return renderResponse(route(helpCandidate, nlu.entities, nlu));
    }
    return renderResponse(respondUnknown());
  }

  if (second && second.score >= 0.45 && top.score - second.score < 0.15) {
    const firstOption = intentOptionLabel(top.intent.id);
    const secondOption = intentOptionLabel(second.intent.id);
    return renderResponse(
      `Did you mean ${firstOption} or ${secondOption}?`
    );
  }

  return renderResponse(route(top, nlu.entities, nlu));
}

function getIntentById(intentId) {
  return INTENT_REGISTRY.find((intent) => intent.id === intentId);
}

function intentOptionLabel(intentId) {
  const labels = {
    "bio.basic": "his bio basics",
    "career.clubs": "his club timeline",
    "career.club_stats": "his club stats",
    "national.team": "his Brazil record",
    "honours.trophies": "his trophies",
    playstyle: "his playstyle",
    injuries: "his injuries",
    family: "his family details",
    quotes: "a Neymar quote",
    funfacts: "Neymar fun facts",
    social: "his social links",
    help: "help topics"
  };
  return labels[intentId] || intentId;
}

function maybeAddSuggestion(baseText) {
  if (Math.random() < 0.4) {
    return `${baseText}\n\nWant his trophies or Brazil record?`;
  }
  return baseText;
}

function respondBioBasic() {
  const message =
    `Neymar's full name is ${neymarData.fullName}. He was born on ${neymarData.birth.date} in ${neymarData.birth.place}. ` +
    `He is ${neymarData.nationality}, ${neymarData.height}, plays mainly as ${neymarData.positions[0]}, and prefers his ${neymarData.preferredFoot} foot.`;
  return maybeAddSuggestion(message);
}

function respondCareerClubs() {
  const timeline = neymarData.clubCareer
    .map((item) => `${item.years}: ${item.club}`)
    .join(" -> ");
  const message = `Club timeline: ${timeline}. Current club: ${neymarData.currentClub}.`;
  return maybeAddSuggestion(message);
}

function respondCareerClubStats(ctx) {
  const clubKey = ctx.entities.clubs[0];
  if (clubKey) {
    const clubMap = {
      santos: "santos",
      barcelona: "barcelona",
      psg: "paris saint-germain",
      al_hilal: "al-hilal"
    };
    const needle = clubMap[clubKey];
    const clubData = neymarData.clubCareer.find((item) =>
      item.club.toLowerCase().includes(needle)
    );
    if (!clubData) {
      return MISSING_DETAIL_REPLY;
    }
    return `${clubData.club}: ${clubData.appearances} apps, ${clubData.goals} goals (${clubData.years}).`;
  }

  const shortStats = neymarData.clubCareer
    .slice(0, 4)
    .map((item) => `${item.club} ${item.goals}G/${item.appearances}A`)
    .join("; ");
  return maybeAddSuggestion(`Club stats snapshot: ${shortStats}.`);
}

function respondNationalTeam() {
  const message =
    `Brazil record: ${neymarData.nationalTeam.goals} goals in ${neymarData.nationalTeam.caps} caps. ` +
    `Debut: ${neymarData.nationalTeam.debut}.`;
  return maybeAddSuggestion(message);
}

function respondHonoursTrophies() {
  const message =
    `Major honours include ${neymarData.trophies.club[0]}, ${neymarData.trophies.club[1]}, and ${neymarData.trophies.international[0]}. ` +
    `Individual highlight: ${neymarData.trophies.individual[0]}.`;
  return maybeAddSuggestion(message);
}

function respondPlaystyle() {
  const message =
    `${neymarData.playStyle.summary} Key traits: ${neymarData.playStyle.traits.slice(0, 4).join(", ")}.`;
  return maybeAddSuggestion(message);
}

function respondInjuries() {
  const short = neymarData.injuries.map((item) => `${item.year}: ${item.brief}`).join(" ");
  return maybeAddSuggestion(`Injury timeline: ${short}`);
}

function respondFamily() {
  return `Family details: father - ${neymarData.family.father}; son - ${neymarData.family.son}.`;
}

function respondQuotes() {
  const quote = neymarData.quotes[Math.floor(Math.random() * neymarData.quotes.length)];
  return `Neymar quote: "${quote}"`;
}

function respondFunFacts() {
  const message = `Fun facts: ${neymarData.funFacts[0]} Also, ${neymarData.funFacts[1]}`;
  return maybeAddSuggestion(message);
}

function respondSocial() {
  if (!neymarData.socialMedia.instagram && !neymarData.socialMedia.twitter) {
    return MISSING_DETAIL_REPLY;
  }
  return `Instagram: ${neymarData.socialMedia.instagram} | Twitter: ${neymarData.socialMedia.twitter}`;
}

function respondHelp() {
  return [
    "You can ask about: bio, clubs, club stats, Brazil record, trophies, playstyle, injuries, family, quotes, fun facts, and social links.",
    "Examples: \"Neymar clubs\", \"Brazil goals\", \"Neymar injuries\", \"Neymar quote\"."
  ].join("\n\n");
}

function respondUnknown() {
  return UNKNOWN_FALLBACK_REPLY;
}

function respondNonNeymarGuard() {
  return NON_NEYMAR_GUARD_REPLY;
}

const NLU_TEST_CASES = [
  { question: "When was Neymar born?", expectedIntent: "bio.basic" },
  { question: "What teams has Neymar played for?", expectedIntent: "career.clubs" },
  { question: "Barca goals and apps?", expectedIntent: "career.club_stats" },
  { question: "Brazil caps and goals?", expectedIntent: "national.team" },
  { question: "What titles has he won?", expectedIntent: "honours.trophies" },
  { question: "Describe Neymar style", expectedIntent: "playstyle" },
  { question: "Tell me his injuries", expectedIntent: "injuries" },
  { question: "Who is Neymar son?", expectedIntent: "family" },
  { question: "Give me a Neymar quote", expectedIntent: "quotes" },
  { question: "Any fun facts?", expectedIntent: "funfacts" },
  { question: "What is his instagram?", expectedIntent: "social" },
  { question: "help", expectedIntent: "help" },
  { question: "Who is Messi?", expectedIntent: "non_neymar_guard" }
];

function runIntentSmokeTests() {
  return NLU_TEST_CASES.map((item) => {
    const result = detectIntents(item.question);
    const predicted = result.guardTriggered
      ? "non_neymar_guard"
      : result.rankedIntents[0]?.intent.id || "unknown";
    return {
      question: item.question,
      expectedIntent: item.expectedIntent,
      predictedIntent: predicted,
      pass: predicted === item.expectedIntent
    };
  });
}

if (typeof window !== "undefined") {
  window.getBotReply = getBotReply;
  window.NeymarGPTChat = {
    neymarData,
    normalize,
    tokenize,
    spellFixLite,
    detectIntents,
    extractEntities,
    route,
    renderResponse,
    getBotReply,
    runIntentSmokeTests,
    NLU_TEST_CASES
  };
}
