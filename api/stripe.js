export const config = { runtime: "nodejs" };

import { createCheckout, webhook } from "./utils/stripeHandlers";

export default async function handler(req, res) {
  if (req.method === "POST") {
    if (req.query.webhook === "1") {
      return webhook(req, res);
    }
    return createCheckout(req, res);
  }

  res.status(405).json({ error: "Method not allowed" });
}
