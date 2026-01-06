// src/utils/providerLinks.js

const getLocale = () => {
  if (typeof navigator === "undefined") return "en";
  return navigator.language?.toLowerCase().startsWith("de") ? "de" : "en";
};

export const PROVIDER_LINKS = {
  netflix: {
    name: "Netflix",
    cancelUrl: {
      de: "https://www.netflix.com/cancelplan",
      en: "https://www.netflix.com/cancelplan",
    },
  },
  spotify: {
    name: "Spotify",
    cancelUrl: {
      de: "https://www.spotify.com/de/account/subscription/",
      en: "https://www.spotify.com/account/subscription/",
    },
  },
  "disney+": {
    name: "Disney+",
    cancelUrl: {
      de: "https://www.disneyplus.com/de-de/account",
      en: "https://www.disneyplus.com/account",
    },
  },
  "apple music": {
    name: "Apple Music",
    cancelUrl: {
      de: "https://support.apple.com/de-de/HT202039",
      en: "https://support.apple.com/en-us/HT202039",
    },
  },
};

export function resolveProviderLink(name) {
  if (!name) return null;

  const normalized = name.toLowerCase();
  const locale = getLocale();

  const provider = Object.values(PROVIDER_LINKS).find((p) =>
    normalized.includes(p.name.toLowerCase())
  );

  if (!provider) return null;

  return {
    name: provider.name,
    cancelUrl: provider.cancelUrl[locale] || provider.cancelUrl.en,
  };
}
