import { kv } from "@vercel/kv";
import bcrypt from "bcryptjs";
import { signToken } from "../utils/jwt"; // use utility instead of inline
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { email, password } = req.body;

  const user = await kv.get(`user:${email}`);

  if (!user) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const token = signToken({ email });

  // ❗ Remove password before sending back user object
  const { password: _, ...safeUser } = user;

  return res.status(200).json({ ok: true, token, user: safeUser });
}
