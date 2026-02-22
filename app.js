(() => {
  "use strict";

  const STORAGE_KEYS = {
    theme: "neymargpt-theme",
    chat: "neymargpt-chat-history"
  };
  const DEFAULT_STATUS = "Ask me anything about Neymar Jr.";
  const BOT_DELAY_MS = 700;
  const MAX_CHAT_HISTORY = 120;
  const VERCEL_GROQ_FUNCTION_ENDPOINT = "/api/groq-chat";
  const NETLIFY_GROQ_FUNCTION_ENDPOINT = "/.netlify/functions/groq-chat";
  const GROQ_TIMEOUT_MS = 12000;
  const OFF_TOPIC_GUARD_HINT = "Try asking about his clubs";
  const LOCAL_GROQ_KEY_STORAGE = "groq_api_key";
  const LOCAL_GROQ_MODEL = "llama-3.3-70b-versatile";
  const LOCAL_GROQ_SYSTEM_PROMPT =
    "You are NeymarGPT. Only answer about Neymar Jr. Keep replies concise. If unrelated, say: " +
    "Sorry, I only answer questions about Neymar Jr. 😅 Try asking about his clubs, Brazil goals, trophies, or injuries.";

  const neymarData = {
    fullName: "Neymar da Silva Santos Junior",
    nicknames: ["Ney", "Neymar Jr.", "Menino Ney"],
    birth: {
      isoDate: "1992-02-05",
      displayDate: "5 February 1992",
      place: "Mogi das Cruzes, Sao Paulo, Brazil"
    },
    height: "1.75 m (5 ft 9 in)",
    weight: "68 kg (150 lbs)",
    positions: ["Left Winger", "Forward", "Attacking Midfielder"],
    jerseyNumber: 10,
    currentClub: "Santos FC",
    currentStatus: "He returned to Santos in 2024 after an injury period at Al-Hilal.",
    netWorth: "$250 million (estimated)",
    socialMedia: {
      instagram: "https://instagram.com/neymarjr",
      twitter: "https://twitter.com/neymarjr"
    },
    clubCareer: [
      { club: "Santos FC", years: "2009-2013", appearances: 225, goals: 136, notes: "Won Copa Libertadores and three Campeonato Paulista titles" },
      { club: "FC Barcelona", years: "2013-2017", appearances: 186, goals: 105, notes: "Won UCL, La Liga, and Copa del Rey trophies" },
      { club: "Paris Saint-Germain", years: "2017-2023", appearances: 173, goals: 118, notes: "Won multiple Ligue 1 titles and domestic cups" },
      { club: "Al-Hilal", years: "2023-2024", appearances: 5, goals: 1, notes: "Suffered an ACL injury in October 2023" },
      { club: "Santos FC", years: "2024-Present", appearances: 12, goals: 4, notes: "Returned to his boyhood club" }
    ],
    nationalTeam: {
      caps: 128,
      goals: 79,
      debut: "10 August 2010 vs USA",
      records: [
        "Brazil all-time top scorer (tied or leading depending on source updates)",
        "One of Brazil's most productive assist providers",
        "Olympic Gold medal winner in Rio 2016"
      ],
      achievements: [
        "Olympic Gold Medal - Rio 2016",
        "FIFA Confederations Cup - 2013",
        "Copa America runner-up - 2021"
      ]
    },
    trophies: {
      international: ["Olympic Gold Medal - 2016", "FIFA Confederations Cup - 2013"],
      club: [
        "UEFA Champions League - 2014-15 (Barcelona)",
        "Copa Libertadores - 2011 (Santos)",
        "La Liga - 2014-15, 2015-16 (Barcelona)",
        "Ligue 1 - multiple titles with PSG",
        "Copa del Rey - 2015, 2016, 2017 (Barcelona)",
        "Coupe de France - multiple titles with PSG"
      ],
      individual: [
        "South American Footballer of the Year - 2011, 2012",
        "FIFA Puskas Award - 2011",
        "Samba Gold - multiple years",
        "FIFA FIFPro World XI - 2015, 2017"
      ]
    },
    playStyle: {
      description: "Neymar is known for elite dribbling, creativity, quick direction changes, and one-v-one attacking flair.",
      keyTraits: ["Dribbling", "Flair", "Vision", "Agility", "Set pieces", "Playmaking"],
      strengths: [
        "Close control in tight spaces",
        "Chance creation from the left half-space",
        "Quick combination play",
        "Finishing and through-ball timing",
        "Ability to draw fouls in dangerous areas"
      ]
    },
    injuries: [
      { year: 2014, description: "Fractured vertebra at the 2014 World Cup quarterfinal" },
      { year: 2018, description: "Fractured fifth metatarsal, missed key club fixtures" },
      { year: 2019, description: "Right ankle sprain, multi-week layoff" },
      { year: 2021, description: "Left ankle ligament damage" },
      { year: 2023, description: "ACL and meniscus injury with Brazil" }
    ],
    offPitch: {
      hobbies: ["Poker", "Gaming", "Music and dance", "Spending time with friends and family"],
      charities: [
        "Instituto Neymar Jr. supports underserved children and families in Brazil",
        "Donations to healthcare and social causes",
        "Support for youth-focused community projects"
      ],
      funFacts: [
        "He became a global star while still very young at Santos",
        "He won Olympic Gold with Brazil in Rio",
        "He is one of football's biggest social media personalities",
        "He played in the famous MSN attacking trio at Barcelona"
      ]
    },
    endorsements: ["Puma", "Red Bull", "Qatar Airways", "Beats by Dre", "Gillette", "EA Sports", "Mastercard"],
    records: [
      "Most expensive transfer in football history at the time (Barcelona to PSG)",
      "One of the few stars to win both Copa Libertadores and UEFA Champions League",
      "Among Brazil's highest-ever scorers and assist leaders"
    ],
    quotes: [
      "I am not a superstar. I am a football player who wants to improve every day.",
      "My ambition is always to win and enjoy football.",
      "Pressure is part of football. I focus on helping my team."
    ]
  };

  const INTENT_CONFIG = [
    {
      id: "birthday",
      prompt: "Neymar's birthday",
      phrases: ["when was neymar born", "what is neymar birthday", "date of birth"],
      keywords: ["birthday", "born", "birth", "age"],
      combos: [["birthday", "neymar"], ["born", "neymar"]]
    },
    {
      id: "clubs",
      prompt: "Neymar clubs",
      phrases: ["what teams has neymar played for", "club career", "career clubs"],
      keywords: ["clubs", "club", "teams", "team", "career", "transfer"],
      combos: [["clubs", "neymar"], ["teams", "neymar"]]
    },
    {
      id: "trophies",
      prompt: "Neymar trophies",
      phrases: ["what has neymar won", "major achievements", "which titles"],
      keywords: ["trophies", "trophy", "titles", "title", "awards", "award", "won"],
      combos: [["trophies", "neymar"], ["titles", "neymar"]]
    },
    {
      id: "brazil_stats",
      prompt: "Neymar Brazil stats",
      phrases: ["how many goals for brazil", "brazil stats", "national team stats"],
      keywords: ["brazil", "selecao", "goals", "caps", "stats", "national"],
      combos: [["goals", "brazil"], ["caps", "brazil"]]
    },
    {
      id: "playstyle",
      prompt: "Neymar playstyle",
      phrases: ["how does neymar play", "playing style", "style of play"],
      keywords: ["playstyle", "style", "skills", "dribbling", "flair"],
      combos: [["style", "neymar"]]
    },
    {
      id: "injuries",
      prompt: "Neymar injuries",
      phrases: ["injury history", "major injuries", "recent injury"],
      keywords: ["injury", "injuries", "injured", "acl", "recovery"],
      combos: [["injury", "neymar"]]
    },
    {
      id: "quotes",
      prompt: "Neymar quotes",
      phrases: ["famous quote", "neymar quote", "what did neymar say"],
      keywords: ["quote", "quotes", "said", "saying"],
      combos: [["quote", "neymar"]]
    },
    {
      id: "family",
      prompt: "Neymar family",
      phrases: ["tell me about his family", "does neymar have a son", "neymar family"],
      keywords: ["family", "son", "child", "children", "davi"],
      combos: [["family", "neymar"]]
    },
    {
      id: "fun_facts",
      prompt: "Neymar fun facts",
      phrases: ["fun facts", "interesting facts", "trivia"],
      keywords: ["fun", "facts", "fact", "trivia", "interesting"],
      combos: [["facts", "neymar"]]
    }
  ];

  const FALLBACK_MESSAGE = "Sorry, I only answer questions about Neymar Jr.";
  const SYNONYM_MAP = {
    born: "birthday",
    birth: "birthday",
    birthday: "birthday",
    teams: "clubs",
    team: "clubs",
    club: "clubs",
    clubs: "clubs",
    title: "trophies",
    titles: "trophies",
    trophy: "trophies",
    awards: "trophies",
    award: "trophies",
    stats: "stats",
    brazilian: "brazil",
    selecao: "brazil",
    style: "playstyle",
    playing: "playstyle",
    injuries: "injury",
    quote: "quotes",
    saying: "quotes",
    facts: "fact",
    trivia: "fact"
  };

  const NEYMAR_CONTEXT_KEYWORDS = ["neymar", "jr", "santos", "barcelona", "psg", "alhilal", "brazil", "selecao", "davi", "puskas", "copa", "ligue", "libertadores"];
  const OFF_TOPIC_KEYWORDS = ["weather", "temperature", "recipe", "cook", "bitcoin", "crypto", "stock", "nvidia", "tesla", "politics", "election", "movie", "series", "python", "javascript", "code", "programming", "restaurant", "hotel", "travel", "flight", "nba", "nfl", "nhl", "cricket", "tennis"];
  const OTHER_PLAYER_KEYWORDS = ["messi", "ronaldo", "mbappe", "haaland", "vinicius", "modric", "debruyne", "lewandowski"];

  let appState = { isProcessing: false, typingNode: null, history: [] };
  let groqState = { lastError: "", lastSource: "init", lastEndpoint: "" };

  document.addEventListener("DOMContentLoaded", init);

  function init() {
    const elements = getElements();
    if (!elements.chatInput || !elements.sendBtn || !elements.chatMessages) return;

    initializeEntranceAnimations(elements);
    initializeFloatingAnimations();
    initializeThemeToggle(elements);
    initializeMobileNavigation(elements);
    initializeGalleryFilters(elements);
    initializeSmoothScrolling(elements);
    initializeNavHideOnScroll();
    initializeChat(elements);
  }

  function getElements() {
    return {
      navLinks: document.getElementById("navLinks"),
      mobileMenuBtn: document.getElementById("mobileMenuBtn"),
      themeToggle: document.getElementById("themeToggle"),
      cards: Array.from(document.querySelectorAll(".card")),
      galleryItems: Array.from(document.querySelectorAll(".gallery-item")),
      chatContainer: document.querySelector(".chat-container"),
      chatInput: document.getElementById("chatInput"),
      sendBtn: document.getElementById("sendBtn"),
      clearChatBtn: document.getElementById("clearChatBtn"),
      chatMessages: document.getElementById("chatMessages"),
      chatStatus: document.getElementById("chatStatus"),
      questionCards: Array.from(document.querySelectorAll(".question-card")),
      galleryButtons: Array.from(document.querySelectorAll(".gallery-btn")),
      clubGalleries: Array.from(document.querySelectorAll(".club-gallery"))
    };
  }

  function initializeEntranceAnimations(elements) {
    window.setTimeout(() => {
      elements.cards.forEach((card) => card.classList.add("animate"));
      elements.galleryItems.forEach((item) => item.classList.add("animate"));
      elements.questionCards.forEach((card) => card.classList.add("animate"));
      if (elements.chatContainer) {
        elements.chatContainer.classList.add("animate");
      }
    }, 250);
  }

  function initializeFloatingAnimations() {
    document.querySelectorAll(".floating").forEach((element) => {
      element.style.animationDelay = `${(Math.random() * 1.8).toFixed(2)}s`;
    });
  }

  function initializeThemeToggle(elements) {
    if (!elements.themeToggle) {
      return;
    }

    const savedTheme = localStorage.getItem(STORAGE_KEYS.theme);
    applyTheme(savedTheme === "light" ? "light" : "dark", elements.themeToggle);

    elements.themeToggle.addEventListener("click", () => {
      const nextTheme = document.body.classList.contains("light-mode") ? "dark" : "light";
      applyTheme(nextTheme, elements.themeToggle);
      localStorage.setItem(STORAGE_KEYS.theme, nextTheme);
    });
  }

  function applyTheme(theme, themeToggle) {
    const isLight = theme === "light";
    document.body.classList.toggle("light-mode", isLight);
    document.body.classList.toggle("dark-mode", !isLight);
    themeToggle.setAttribute("aria-pressed", String(isLight));
  }

  function initializeMobileNavigation(elements) {
    if (!elements.mobileMenuBtn || !elements.navLinks) {
      return;
    }

    elements.mobileMenuBtn.addEventListener("click", () => {
      const isOpen = elements.navLinks.classList.toggle("active");
      elements.mobileMenuBtn.setAttribute("aria-expanded", String(isOpen));
      elements.mobileMenuBtn.innerHTML = isOpen
        ? '<i class="fas fa-times" aria-hidden="true"></i>'
        : '<i class="fas fa-bars" aria-hidden="true"></i>';
    });
  }

  function initializeGalleryFilters(elements) {
    if (!elements.galleryButtons.length || !elements.clubGalleries.length) {
      return;
    }


    elements.galleryButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const filter = button.dataset.filter;
        elements.galleryButtons.forEach((item) => item.classList.remove("active"));
        button.classList.add("active");

        elements.clubGalleries.forEach((gallery) => {
          const showGallery = filter === "all" || gallery.dataset.category === filter;
          gallery.style.display = showGallery ? "block" : "none";
        });
      });
    });
  }

  function initializeSmoothScrolling(elements) {
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener("click", (event) => {
        const href = anchor.getAttribute("href");
        if (!href || href.length < 2) {
          return;
        }

        const target = document.querySelector(href);
        if (!target) {
          return;
        }

        event.preventDefault();
        window.scrollTo({ top: target.offsetTop - 80, behavior: "smooth" });

        if (elements.navLinks && elements.mobileMenuBtn) {
          elements.navLinks.classList.remove("active");
          elements.mobileMenuBtn.setAttribute("aria-expanded", "false");
          elements.mobileMenuBtn.innerHTML = '<i class="fas fa-bars" aria-hidden="true"></i>';
        }
      });
    });
  }

  function initializeNavHideOnScroll() {
    const nav = document.querySelector("nav");
    if (!nav) {
      return;
    }

    let lastScrollTop = 0;
    window.addEventListener("scroll", () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      if (scrollTop > lastScrollTop && scrollTop > 100) {
        nav.classList.add("hidden");
      } else {
        nav.classList.remove("hidden");
      }
      lastScrollTop = scrollTop;
    });
  }

  function initializeChat(elements) {
    loadStoredMessages(elements);

    elements.sendBtn.addEventListener("click", () => {
      void sendCurrentInput(elements);
    });

    elements.chatInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        void sendCurrentInput(elements);
      }
    });

    elements.questionCards.forEach((card) => {
      const question = card.getAttribute("data-question");
      card.setAttribute("role", "button");
      card.setAttribute("tabindex", "0");
      if (question) {
        card.setAttribute("aria-label", `Ask: ${question}`);
      }

      card.addEventListener("click", () => {
        if (!question) {
          return;
        }
        elements.chatInput.value = question;
        void sendCurrentInput(elements);
      });

      card.addEventListener("keydown", (event) => {
        if ((event.key === "Enter" || event.key === " ") && question) {
          event.preventDefault();
          elements.chatInput.value = question;
          void sendCurrentInput(elements);
        }
      });
    });

    if (elements.clearChatBtn) {
      elements.clearChatBtn.addEventListener("click", () => {
        clearChatHistory(elements);
      });
    }
  }

  function loadStoredMessages(elements) {
    appState.history = readHistoryFromStorage();
    elements.chatMessages.innerHTML = "";

    if (!appState.history.length) {
      appendMessage(
        elements,
        {
          sender: "bot",
          text: "Hi, I am NeymarGPT. Ask me anything about Neymar Jr. career, stats, style, achievements, or personal life.",
          timestamp: Date.now()
        },
        true
      );
      return;
    }

    appState.history.forEach((message) => appendMessage(elements, message, false));
    scrollChatToBottom(elements.chatMessages, false);
  }

  function clearChatHistory(elements) {
    appState.history = [];
    writeHistoryToStorage(appState.history);
    elements.chatMessages.innerHTML = "";

    appendMessage(
      elements,
      {
        sender: "bot",
        text: "Chat cleared. Ask any Neymar Jr. question and I will jump in.",
        timestamp: Date.now()
      },
      true
    );

    elements.chatInput.focus();
  }

  async function sendCurrentInput(elements) {
    if (appState.isProcessing) {
      return;
    }

    const parsedInput = parseInput(elements.chatInput.value);
    if (!parsedInput.raw) {
      return;
    }

    appendMessage(elements, { sender: "user", text: parsedInput.raw, timestamp: Date.now() }, true);
    elements.chatInput.value = "";
    setProcessingState(elements, true);
    showTypingIndicator(elements);

    await delay(BOT_DELAY_MS + Math.floor(Math.random() * 350));

    const responseText = await generateBotResponse(parsedInput);
    hideTypingIndicator();
    appendMessage(elements, { sender: "bot", text: responseText, timestamp: Date.now() }, true);

    setProcessingState(elements, false);
    elements.chatInput.focus();
  }

  function parseInput(rawInput) {
    const raw = String(rawInput || "").trim();
    const normalized = normalizeText(raw);
    const tokens = normalized ? normalized.split(" ").filter(Boolean) : [];
    const synonymTokens = tokens.map((token) => SYNONYM_MAP[token] || token);
    const expandedTokens = Array.from(new Set([...tokens, ...synonymTokens]));
    return { raw, normalized, tokens, uniqueTokens: expandedTokens };
  }

  function normalizeText(value) {
    return value
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function detectIntent(parsedInput) {
    const scoredIntents = INTENT_CONFIG
      .map((intent) => ({ intent, score: scoreIntent(parsedInput, intent) }))
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score);

    if (!scoredIntents.length) {
      return { type: "none", scoredIntents: [] };
    }

    const [best, second] = scoredIntents;
    if (best.score < 3) {
      return { type: "weak", scoredIntents, best };
    }

    if (second && second.score >= best.score - 1) {
      return { type: "ambiguous", scoredIntents, best, second };
    }

    return { type: "match", scoredIntents, best };
  }

  function scoreIntent(parsedInput, intent) {
    let score = 0;

    intent.phrases.forEach((phrase) => {
      if (parsedInput.normalized.includes(phrase)) {
        score += 5;
      }
    });

    intent.keywords.forEach((keyword) => {
      if (parsedInput.uniqueTokens.some((token) => tokenMatchesKeyword(token, keyword))) {
        score += 2;
      }
    });

    if (intent.combos) {
      intent.combos.forEach((combo) => {
        const comboMatched = combo.every((comboWord) =>
          parsedInput.uniqueTokens.some((token) => tokenMatchesKeyword(token, comboWord))
        );
        if (comboMatched) {
          score += 4;
        }
      });
    }

    return score;
  }

  function tokenMatchesKeyword(token, keyword) {
    if (token === keyword) {
      return true;
    }

    if (token.length >= 4 && (token.startsWith(keyword) || keyword.startsWith(token))) {
      return true;
    }

    const maxDistance = keyword.length >= 7 ? 2 : 1;
    if (Math.abs(token.length - keyword.length) > maxDistance) {
      return false;
    }

    return levenshteinDistance(token, keyword) <= maxDistance;
  }

  function levenshteinDistance(a, b) {
    if (a === b) {
      return 0;
    }

    const matrix = Array.from({ length: a.length + 1 }, () => []);

    for (let i = 0; i <= a.length; i += 1) {
      matrix[i][0] = i;
    }
    for (let j = 0; j <= b.length; j += 1) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= a.length; i += 1) {
      for (let j = 1; j <= b.length; j += 1) {
        const cost = a[i - 1] === b[j - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j - 1] + cost
        );
      }
    }

    return matrix[a.length][b.length];
  }

  async function generateBotResponse(parsedInput) {
    const userText = parsedInput.raw || parsedInput.normalized || "";
    const localReply = generateOfflineBotResponse(parsedInput);
    const hasHardGuardReply =
      typeof localReply === "string" && localReply.includes(OFF_TOPIC_GUARD_HINT);

    // Keep strict Neymar-only guard local and deterministic.
    if (hasHardGuardReply || isOffTopic(parsedInput)) {
      groqState.lastSource = "offline-guard";
      groqState.lastEndpoint = "";
      return localReply;
    }

    const groqReply = await requestGroqReply(userText);
    if (groqReply) {
      if (typeof console !== "undefined" && typeof console.info === "function") {
        console.info("[NeymarGPT] Reply source:", groqState.lastSource, groqState.lastEndpoint || "");
      }
      return groqReply;
    }

    groqState.lastSource = "offline-fallback";
    groqState.lastEndpoint = "";
    return localReply;
  }

  function generateOfflineBotResponse(parsedInput) {
    if (typeof window !== "undefined" && typeof window.getBotReply === "function") {
      const smartReply = window.getBotReply(parsedInput.raw || parsedInput.normalized || "");
      if (typeof smartReply === "string" && smartReply.trim()) {
        return smartReply.trim();
      }
    }

    if (!parsedInput.normalized) {
      return FALLBACK_MESSAGE;
    }

    if (isOffTopic(parsedInput)) {
      return FALLBACK_MESSAGE;
    }

    const intentResult = detectIntent(parsedInput);

    if (intentResult.type === "match") {
      return generateIntentResponse(intentResult.best.intent.id);
    }

    if (intentResult.type === "ambiguous") {
      const options = intentResult.scoredIntents.slice(0, 2).map((item) => item.intent.prompt);
      return "Did you mean " + options[0] + " or " + options[1] + "?";
    }

    return FALLBACK_MESSAGE;
  }

  async function requestGroqReply(userText) {
    const message = String(userText || "").trim();
    if (!message) {
      return null;
    }

    const history = appState.history
      .slice(0, -1)
      .slice(-8)
      .map((entry) => ({
        role: entry.sender === "user" ? "user" : "assistant",
        content: String(entry.text || "").trim()
      }))
      .filter((entry) => entry.content);

    const proxyEndpoints = buildGroqProxyEndpoints();
    for (const endpoint of proxyEndpoints) {
      const proxyReply = await requestGroqViaProxy(endpoint, message, history);
      if (proxyReply) {
        groqState.lastError = "";
        groqState.lastSource = "groq-proxy";
        groqState.lastEndpoint = endpoint;
        return proxyReply;
      }
    }

    // Optional client-side fallback: useful when deployed without functions.
    const directReply = await requestGroqDirectClientKey(message, history);
    if (directReply) {
      groqState.lastError = "";
      groqState.lastSource = "groq-direct-client-key";
      groqState.lastEndpoint = "https://api.groq.com/openai/v1/chat/completions";
      return directReply;
    }

    reportGroqIssue();
    return null;
  }

  function buildGroqProxyEndpoints() {
    const endpoints = [];
    const runtimeHost = getRuntimeHost();

    // Prefer the matching platform endpoint to avoid noisy 404 fallbacks.
    if (runtimeHost.includes("vercel.app")) {
      endpoints.push(VERCEL_GROQ_FUNCTION_ENDPOINT);
    } else if (runtimeHost.includes("netlify.app")) {
      endpoints.push(NETLIFY_GROQ_FUNCTION_ENDPOINT);
    } else {
      endpoints.push(VERCEL_GROQ_FUNCTION_ENDPOINT, NETLIFY_GROQ_FUNCTION_ENDPOINT);
    }

    if (isLocalhostRuntime()) {
      endpoints.push("http://localhost:3000/api/groq-chat");
      endpoints.push("http://127.0.0.1:3000/api/groq-chat");
      endpoints.push("http://localhost:3001/api/groq-chat");
      endpoints.push("http://127.0.0.1:3001/api/groq-chat");
      endpoints.push("http://localhost:8888/.netlify/functions/groq-chat");
      endpoints.push("http://127.0.0.1:8888/.netlify/functions/groq-chat");
    }

    return Array.from(new Set(endpoints));
  }

  function isLocalhostRuntime() {
    const host = getRuntimeHost();
    return host === "localhost" || host === "127.0.0.1" || host === "";
  }

  function getRuntimeHost() {
    if (typeof window === "undefined" || !window.location) {
      return "";
    }

    const host = String(window.location.hostname || "").toLowerCase();
    return host;
  }

  function isOffTopic(parsedInput) {
    const hasNeymarContext = parsedInput.uniqueTokens.some((token) =>
      NEYMAR_CONTEXT_KEYWORDS.some((keyword) => tokenMatchesKeyword(token, keyword))
    );

    if (hasNeymarContext) {
      return false;
    }

    const hasGreeting = parsedInput.uniqueTokens.some((token) =>
      ["hi", "hello", "hey"].some((greeting) => tokenMatchesKeyword(token, greeting))
    );

    if (hasGreeting) {
      return false;
    }

    const hasOffTopicKeyword = parsedInput.uniqueTokens.some((token) =>
      OFF_TOPIC_KEYWORDS.some((keyword) => tokenMatchesKeyword(token, keyword))
    );

    if (hasOffTopicKeyword) {
      return true;
    }

    return OTHER_PLAYER_KEYWORDS.some((name) => parsedInput.normalized.includes(name));
  }

  async function requestGroqViaProxy(endpoint, message, history) {
    try {
      const controller = new AbortController();
      const timeoutId = window.setTimeout(() => controller.abort(), GROQ_TIMEOUT_MS);

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ message, history }),
        signal: controller.signal
      });

      window.clearTimeout(timeoutId);
      if (!response.ok) {
        let detail = "";
        try {
          detail = await response.text();
        } catch (_error) {
          detail = "";
        }
        groqState.lastError =
          "Proxy " +
          endpoint +
          " returned " +
          response.status +
          (detail ? " - " + detail.slice(0, 200) : "");
        return null;
      }

      const payload = await response.json();
      const reply = typeof payload.reply === "string" ? payload.reply.trim() : "";
      return reply || null;
    } catch (error) {
      groqState.lastError = "Proxy " + endpoint + " failed: " + String(error.message || error);
      return null;
    }
  }

  function getClientGroqApiKey() {
    if (typeof window === "undefined") {
      return "";
    }

    if (typeof window.GROQ_API_KEY === "string" && window.GROQ_API_KEY.trim()) {
      return window.GROQ_API_KEY.trim();
    }

    try {
      const key = window.localStorage.getItem(LOCAL_GROQ_KEY_STORAGE);
      return typeof key === "string" ? key.trim() : "";
    } catch (_error) {
      return "";
    }
  }

  async function requestGroqDirectClientKey(message, history) {
    const apiKey = getClientGroqApiKey();
    if (!apiKey) {
      return null;
    }

    try {
      const controller = new AbortController();
      const timeoutId = window.setTimeout(() => controller.abort(), GROQ_TIMEOUT_MS);

      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + apiKey
        },
        body: JSON.stringify({
          model: LOCAL_GROQ_MODEL,
          temperature: 0.35,
          max_tokens: 320,
          messages: [
            { role: "system", content: LOCAL_GROQ_SYSTEM_PROMPT },
            ...history,
            { role: "user", content: message }
          ]
        }),
        signal: controller.signal
      });

      window.clearTimeout(timeoutId);
      if (!response.ok) {
        return null;
      }

      const payload = await response.json();
      const reply = payload?.choices?.[0]?.message?.content;
      return typeof reply === "string" && reply.trim() ? reply.trim() : null;
    } catch (error) {
      groqState.lastError = "Direct Groq request failed: " + String(error.message || error);
      return null;
    }
  }

  function reportGroqIssue() {
    if (!groqState.lastError) {
      groqState.lastError =
        "No Groq proxy endpoint responded and no client key was available.";
    }

    if (typeof console !== "undefined" && typeof console.warn === "function") {
      console.warn("[NeymarGPT] Groq unavailable:", groqState.lastError);
      console.warn(
        "[NeymarGPT] Fix: on Vercel set GROQ_API_KEY in Project Settings -> Environment Variables and redeploy (API route /api/groq-chat), or set window.GROQ_API_KEY / localStorage.groq_api_key for client fallback."
      );
    }
  }

  function generateIntentResponse(intentId) {
    const uniqueClubs = Array.from(new Set(neymarData.clubCareer.map((item) => item.club)));
    const lastInjury = neymarData.injuries[neymarData.injuries.length - 1];

    switch (intentId) {
      case "birthday":
        return (
          "Neymar was born on " +
          neymarData.birth.displayDate +
          " in " +
          neymarData.birth.place +
          ". He is " +
          calculateAge(neymarData.birth.isoDate) +
          "."
        );

      case "clubs":
        return (
          "Neymar has played for " +
          uniqueClubs.join(", ") +
          ". Current club: " +
          neymarData.currentClub +
          "."
        );

      case "trophies":
        return [
          "Major trophies: " + neymarData.trophies.international[0] + ", " + neymarData.trophies.club[0] + ".",
          "Also: " + neymarData.trophies.club[1] + "."
        ].join(" ");

      case "brazil_stats":
        return (
          "Brazil stats: " +
          neymarData.nationalTeam.goals +
          " goals in " +
          neymarData.nationalTeam.caps +
          " caps. Debut: " +
          neymarData.nationalTeam.debut +
          "."
        );

      case "playstyle":
        return (
          neymarData.playStyle.description +
          " Key traits: " +
          neymarData.playStyle.keyTraits.slice(0, 3).join(", ") +
          "."
        );

      case "injuries":
        return (
          "Recent major injury: " +
          lastInjury.year +
          " - " +
          lastInjury.description +
          "."
        );

      case "quotes":
        return "Neymar quote: \"" + neymarData.quotes[0] + "\"";

      case "family":
        return "Neymar has a son named Davi Lucca and often shares family moments publicly.";

      case "fun_facts":
        return (
          "Fun facts: " +
          neymarData.offPitch.funFacts[0] +
          " Also, " +
          neymarData.offPitch.funFacts[1] +
          "."
        );

      default:
        return FALLBACK_MESSAGE;
    }
  }

  function appendMessage(elements, message, persist) {
    const messageNode = renderMessage(message);
    elements.chatMessages.appendChild(messageNode);

    window.requestAnimationFrame(() => {
      messageNode.classList.add("animate");
      scrollChatToBottom(elements.chatMessages, true);
    });

    if (persist) {
      appState.history.push({ sender: message.sender, text: message.text, timestamp: message.timestamp });
      if (appState.history.length > MAX_CHAT_HISTORY) {
        appState.history = appState.history.slice(-MAX_CHAT_HISTORY);
      }
      writeHistoryToStorage(appState.history);
    }
  }

  function renderMessage(message) {
    const wrapper = document.createElement("article");
    wrapper.className = `message ${message.sender === "user" ? "user-message" : "bot-message"}`;
    wrapper.setAttribute("role", "listitem");

    const messageText = document.createElement("p");
    messageText.className = "message-text";
    messageText.textContent = message.text;

    const timestamp = document.createElement("time");
    timestamp.className = "message-time";
    timestamp.dateTime = new Date(message.timestamp).toISOString();
    timestamp.textContent = formatTime(message.timestamp);

    wrapper.appendChild(messageText);
    wrapper.appendChild(timestamp);
    return wrapper;
  }

  function showTypingIndicator(elements) {
    if (appState.typingNode) {
      return;
    }

    const typingNode = document.createElement("div");
    typingNode.className = "message bot-message typing-indicator";

    const label = document.createElement("span");
    label.className = "typing-label";
    label.textContent = "NeymarGPT is typing";

    const dots = document.createElement("span");
    dots.className = "typing-dots";
    dots.setAttribute("aria-hidden", "true");

    for (let i = 0; i < 3; i += 1) {
      dots.appendChild(document.createElement("span"));
    }

    typingNode.appendChild(label);
    typingNode.appendChild(dots);
    elements.chatMessages.appendChild(typingNode);

    window.requestAnimationFrame(() => {
      typingNode.classList.add("animate");
      scrollChatToBottom(elements.chatMessages, true);
    });

    appState.typingNode = typingNode;
  }

  function hideTypingIndicator() {
    if (!appState.typingNode) {
      return;
    }

    appState.typingNode.remove();
    appState.typingNode = null;
  }

  function setProcessingState(elements, processing) {
    appState.isProcessing = processing;
    elements.sendBtn.disabled = processing;
    elements.sendBtn.setAttribute("aria-disabled", String(processing));

    if (elements.clearChatBtn) {
      elements.clearChatBtn.disabled = processing;
    }

    if (elements.chatStatus) {
      elements.chatStatus.textContent = processing ? "NeymarGPT is thinking..." : DEFAULT_STATUS;
    }
  }

  function scrollChatToBottom(container, smooth) {
    container.scrollTo({ top: container.scrollHeight, behavior: smooth ? "smooth" : "auto" });
  }

  function readHistoryFromStorage() {
    try {
      const rawHistory = localStorage.getItem(STORAGE_KEYS.chat);
      if (!rawHistory) {
        return [];
      }

      const parsed = JSON.parse(rawHistory);
      if (!Array.isArray(parsed)) {
        return [];
      }

      return parsed
        .filter(
          (entry) =>
            entry &&
            (entry.sender === "user" || entry.sender === "bot") &&
            typeof entry.text === "string" &&
            typeof entry.timestamp === "number"
        )
        .slice(-MAX_CHAT_HISTORY);
    } catch (_error) {
      return [];
    }
  }

  function writeHistoryToStorage(history) {
    try {
      localStorage.setItem(STORAGE_KEYS.chat, JSON.stringify(history));
    } catch (_error) {
      // Ignore storage failures safely (private mode or quota).
    }
  }

  function calculateAge(isoDate) {
    const birthDate = new Date(isoDate);
    const now = new Date();
    let age = now.getFullYear() - birthDate.getFullYear();
    const monthDifference = now.getMonth() - birthDate.getMonth();

    if (monthDifference < 0 || (monthDifference === 0 && now.getDate() < birthDate.getDate())) {
      age -= 1;
    }

    return age;
  }

  function formatTime(timestamp) {
    return new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  function delay(ms) {
    return new Promise((resolve) => {
      window.setTimeout(resolve, ms);
    });
  }

  if (typeof window !== "undefined") {
    window.NeymarGPTDebug = window.NeymarGPTDebug || {};
    window.NeymarGPTDebug.getGroqState = function getGroqState() {
      return {
        lastError: groqState.lastError,
        lastSource: groqState.lastSource,
        lastEndpoint: groqState.lastEndpoint
      };
    };
  }
})();
