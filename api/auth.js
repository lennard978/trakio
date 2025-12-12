export const config = { runtime: "nodejs" };

import { signup, login } from "./utils/authHandlers";

export default async function handler(req, res) {
  if (req.method === "POST") {
    if (req.query.action === "signup") return signup(req, res);
    if (req.query.action === "login") return login(req, res);
  }

  return res.status(405).json({ error: "Method not allowed" });
}
