// Category intensity defaults (used for analytics / visuals)
export const CATEGORY_INTENSITY_DEFAULT = Object.freeze({
  bills: 0.18,
  utilities: 0.18,
  streaming: 0.32,
  entertainment: 0.34,
  fitness: 0.28,
  software: 0.26,
  gaming: 0.34,
  other: 0.25
});

// Preset subscription colors
export const PRESET_COLORS = Object.freeze([
  "rgba(248, 113, 113, 0.75)",
  "rgba(250, 204, 21, 0.75)",
  "rgba(74, 222, 128, 0.75)",
  "rgba(96, 165, 250, 0.75)",
  "rgba(167, 139, 250, 0.75)",
  "rgba(244, 114, 182, 0.75)",
  "rgba(52, 211, 153, 0.75)",
  "rgba(249, 115, 22, 0.75)"
]);

// Payment methods (UI metadata, persisted by `value`)
export const PAYMENT_METHODS = Object.freeze([
  {
    value: "visa",
    label: "payment_visa",
    icon: "💳",
    logo: "/icons/visa.svg"
  },
  {
    value: "mastercard",
    label: "payment_mastercard",
    icon: "💳",
    logo: "/icons/mastercard.svg"
  },
  {
    value: "amex",
    label: "payment_amex",
    icon: "💳",
    logo: "/icons/amex.svg"
  },
  {
    value: "paypal",
    label: "payment_paypal",
    icon: "🅿️",
    logo: "/icons/paypal.svg"
  },
  {
    value: "apple_pay",
    label: "payment_apple_pay",
    icon: "",
    logo: "/icons/apple-pay.svg"
  },
  {
    value: "google_pay",
    label: "payment_google_pay",
    icon: "🅶",
    logo: "/icons/google-pay.svg"
  },
  {
    value: "sepa",
    label: "payment_sepa",
    icon: "🏦",
    logo: "/icons/sepa.svg"
  },
  {
    value: "klarna",
    label: "payment_klarna",
    icon: "🅺",
    logo: "/icons/klarna.svg"
  },
  {
    value: "sofort",
    label: "payment_sofort",
    icon: "🏦",
    logo: null
  },
  {
    value: "giropay",
    label: "payment_giropay",
    icon: "🏦",
    logo: "/icons/giropay.svg"
  },
  {
    value: "bank",
    label: "payment_bank_transfer",
    icon: "🏦",
    logo: null
  },
  {
    value: "cash",
    label: "payment_cash",
    icon: "💵",
    logo: null
  },
  {
    value: "crypto",
    label: "payment_crypto",
    icon: "₿",
    logo: null
  }
]);
