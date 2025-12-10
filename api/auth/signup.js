import { kv } from "@vercel/kv";
import bcrypt from "bcryptjs";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Missing fields" });
  }

  const existing = await kv.get(`user:${email}`);
  if (existing) {
    return res.status(409).json({ error: "User already exists" });
  }

  const hashed = await bcrypt.hash(password, 10);

  await kv.set(`user:${email}`, {
    email,
    password: hashed,
    createdAt: Date.now(),
  });

  return res.status(200).json({ ok: true });
}
