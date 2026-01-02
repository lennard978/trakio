export function normalizePayment(p) {
  if (!p.date || typeof p.amount !== "number") {
    throw new Error("Invalid payment object");
  }

  return {
    id: p.id ?? crypto.randomUUID(),
    date: p.date,
    amount: p.amount,
    currency: p.currency || "EUR",
  };
}
