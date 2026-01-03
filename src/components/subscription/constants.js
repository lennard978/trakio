export const CATEGORY_INTENSITY_DEFAULT = {
  bills: 0.18,
  utilities: 0.18,
  streaming: 0.32,
  entertainment: 0.34,
  fitness: 0.28,
  software: 0.26,
  gaming: 0.34,
  other: 0.25,
};

export const PRESET_COLORS = [
  "rgba(248, 113, 113, 0.75)",
  "rgba(250, 204, 21, 0.75)",
  "rgba(74, 222, 128, 0.75)",
  "rgba(96, 165, 250, 0.75)",
  "rgba(167, 139, 250, 0.75)",
  "rgba(244, 114, 182, 0.75)",
  "rgba(52, 211, 153, 0.75)",
  "rgba(249, 115, 22, 0.75)",
];

export const PAYMENT_METHODS = [
  { value: "visa", label: "Visa", icon: "💳", logo: "/icons/visa.svg" },
  { value: "mastercard", label: "Mastercard", icon: "💳", logo: "/icons/mastercard.svg" },
  { value: "paypal", label: "PayPal", icon: "🅿️", logo: "/icons/paypal.svg" },
  { value: "klarna", label: "Klarna", icon: "🅺", logo: "/icons/klarna.svg" },
  { value: "bank", label: "Bank Transfer", icon: "🏦" },
  { value: "cash", label: "Cash", icon: "💵" }
];
