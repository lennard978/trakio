// src/data/subscriptionCatalog.js
// Smart-categorization–ready catalog (offline, deterministic)

export const subscriptionCatalog = [
  /* ---------------- Streaming / Entertainment ---------------- */

  {
    name: "Netflix",
    icon: "netflix",
    category: "streaming",
    match: ["netflix", "netflix.com"],
    confidence: 95,
  },
  {
    name: "Spotify",
    icon: "spotify",
    category: "streaming",
    match: ["spotify", "spotify premium", "spotify family"],
    confidence: 95,
  },
  {
    name: "Disney+",
    icon: "disney",
    category: "streaming",
    match: ["disney+", "disney plus", "disneyplus"],
    confidence: 95,
  },
  {
    name: "YouTube Premium",
    icon: "youtube",
    category: "streaming",
    match: ["youtube premium", "yt premium", "youtube"],
    confidence: 90,
  },
  {
    name: "HBO Max",
    icon: "hbo",
    category: "streaming",
    match: ["hbo", "hbo max"],
    confidence: 90,
  },
  {
    name: "Paramount+",
    icon: "paramount",
    category: "streaming",
    match: ["paramount+", "paramount plus"],
    confidence: 85,
  },

  /* ---------------- Amazon / Apple ---------------- */

  {
    name: "Amazon Prime",
    icon: "amazon",
    category: "shopping",
    match: ["amazon prime", "prime video", "amazon"],
    confidence: 90,
  },
  {
    name: "Kindle Unlimited",
    icon: "kindle",
    category: "books",
    match: ["kindle unlimited", "kindle"],
    confidence: 85,
  },
  {
    name: "Apple Music",
    icon: "apple",
    category: "entertainment",
    match: ["apple music"],
    confidence: 90,
  },
  {
    name: "iCloud+",
    icon: "icloud",
    category: "cloud",
    match: ["icloud", "icloud+"],
    confidence: 90,
  },

  /* ---------------- Audio / Books ---------------- */

  {
    name: "Audible",
    icon: "audible",
    category: "books",
    match: ["audible", "audible uk", "audible de", "audible us"],
    confidence: 90,
  },
  {
    name: "Deezer",
    icon: "deezer",
    category: "entertainment",
    match: ["deezer"],
    confidence: 85,
  },

  /* ---------------- Software / Cloud ---------------- */

  {
    name: "Google One",
    icon: "google",
    category: "cloud",
    match: ["google one"],
    confidence: 85,
  },
  {
    name: "Dropbox",
    icon: "dropbox",
    category: "cloud",
    match: ["dropbox"],
    confidence: 90,
  },
  {
    name: "OneDrive",
    icon: "onedrive",
    category: "cloud",
    match: ["onedrive"],
    confidence: 90,
  },
  {
    name: "Notion",
    icon: "notion",
    category: "productivity",
    match: ["notion"],
    confidence: 95,
  },
  {
    name: "Microsoft 365",
    icon: "office365",
    category: "software",
    match: ["microsoft 365", "office 365"],
    confidence: 95,
  },

  /* ---------------- Dev / AI ---------------- */

  {
    name: "GitHub",
    icon: "github",
    category: "software",
    match: ["github", "github pro"],
    confidence: 90,
  },
  {
    name: "ChatGPT Plus",
    icon: "openai",
    category: "ai_tools",
    match: ["chatgpt", "chat gpt", "openai"],
    confidence: 100,
  },

  /* ---------------- Gaming ---------------- */

  {
    name: "PlayStation Plus",
    icon: "playstation",
    category: "gaming",
    match: ["playstation plus", "ps plus"],
    confidence: 95,
  },
  {
    name: "Xbox Game Pass",
    icon: "xbox",
    category: "gaming",
    match: ["xbox game pass", "game pass"],
    confidence: 95,
  },

  /* ---------------- Creative ---------------- */

  {
    name: "Adobe Creative Cloud",
    icon: "adobe",
    category: "software",
    match: ["adobe", "creative cloud"],
    confidence: 95,
  },

  /* ---------------- Finance ---------------- */

  {
    name: "Klarna",
    icon: "klarna",
    category: "finance",
    match: ["klarna"],
    confidence: 80,
  },
];
