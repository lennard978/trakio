export function getCurrencyFlag(code) {
  const map = {
    USD: "🇺🇸", EUR: "🇪🇺", GBP: "🇬🇧", JPY: "🇯🇵",
    CAD: "🇨🇦", AUD: "🇦🇺", NZD: "🇳🇿",
    CHF: "🇨🇭", SEK: "🇸🇪", NOK: "🇳🇴", DKK: "🇩🇰",
    PLN: "🇵🇱", HUF: "🇭🇺", CZK: "🇨🇿", RON: "🇷🇴",
    BGN: "🇧🇬", SGD: "🇸🇬", MXN: "🇲🇽",
    BRL: "🇧🇷", INR: "🇮🇳", ZAR: "🇿🇦",
    KRW: "🇰🇷", TRY: "🇹🇷", HKD: "🇭🇰",
    AED: "🇦🇪", ILS: "🇮🇱"
  };

  return map[code] || "🏳️";
}
