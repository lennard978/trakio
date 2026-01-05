// /api/overlaps.js
/**
 * Detect overlapping subscriptions (Netflix vs Disney+, Spotify vs Apple Music).
 * This is a pure logic endpoint. No database writes.
 */

export default async function handler(req, res) {
  // Allow only POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { subscriptions } = req.body;

  if (!Array.isArray(subscriptions)) {
    return res.status(400).json({ error: "subscriptions must be an array" });
  }

  // Normalize service names (lowercase, trimmed)
  const normalize = (name = "") => name.trim().toLowerCase();

  /**
   * Known service → overlap group mapping
   * You will EXTEND this over time.
   */
  const SERVICE_TO_GROUP = {
    // Streaming
    "netflix": "Streaming",
    "disney+": "Streaming",
    "disney plus": "Streaming",
    "amazon prime": "Streaming",
    "prime video": "Streaming",
    "hbo max": "Streaming",
    "max": "Streaming",
    "apple tv+": "Streaming",

    // Music
    "spotify": "Music",
    "apple music": "Music",
    "youtube music": "Music",
    "deezer": "Music",
    "tidal": "Music",

    // Cloud Storage
    "google drive": "Cloud Storage",
    "google one": "Cloud Storage",
    "icloud": "Cloud Storage",
    "icloud+": "Cloud Storage",
    "dropbox": "Cloud Storage",
    "onedrive": "Cloud Storage",

    // Productivity
    "microsoft 365": "Productivity",
    "office 365": "Productivity",
    "google workspace": "Productivity"
  };

  /**
   * Decide which overlap group a subscription belongs to
   */
  function inferGroup(sub) {
    const name = normalize(sub.name);

    // 1) Exact known service match
    if (SERVICE_TO_GROUP[name]) {
      return SERVICE_TO_GROUP[name];
    }

    // 2) Keyword heuristics (handles "Netflix Standard", "Spotify Family")
    if (name.includes("netflix")) return "Streaming";
    if (name.includes("disney")) return "Streaming";
    if (name.includes("spotify")) return "Music";
    if (name.includes("music") && name.includes("apple")) return "Music";

    // 3) Fallback to category from UI / DB
    if (sub.category) return sub.category;

    // 4) Unknown → no overlap detection
    return null;
  }

  // Group subscriptions by overlap group
  const grouped = {};

  for (const sub of subscriptions) {
    const group = inferGroup(sub);
    if (!group) continue;

    if (!grouped[group]) {
      grouped[group] = [];
    }

    grouped[group].push({
      id: sub.id,
      name: sub.name,
      price: Number(sub.price || 0),
      currency: sub.currency || "EUR"
    });

  }

  // Only return groups with 2+ items
  const overlaps = Object.entries(grouped)
    .filter(([_, items]) => items.length >= 2)
    .map(([group, items]) => {
      // Sort by price ascending
      const sorted = [...items].sort((a, b) => a.price - b.price);

      const cheapest = sorted[0];
      const others = sorted.slice(1);

      const potentialSavings = others.reduce(
        (sum, s) => sum + (s.price || 0),
        0
      );

      return {
        group,
        keep: {
          id: cheapest.id,
          name: cheapest.name,
          price: cheapest.price,
          currency: cheapest.currency
        },
        cancel: others.map(o => ({
          id: o.id,
          name: o.name,
          price: o.price
        })),
        potentialSavings,
        currency: cheapest.currency,
        items
      };
    })
    .sort((a, b) => a.group.localeCompare(b.group));


  return res.status(200).json({ overlaps });
}
