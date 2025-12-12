export const config = { runtime: "nodejs" };

import { login, signup } from "./utils/authHandlers";

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { action } = req.query;

    if (action === "login") return login(req, res);
    if (action === "signup") return signup(req, res);
  }

  res.status(405).json({ error: "Method not allowed" });
}
