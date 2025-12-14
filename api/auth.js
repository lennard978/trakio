import { kv } from "@vercel/kv";
import bcrypt from "bcryptjs";
import { signToken } from "./utils/jwt.js";

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const { action, email, password } = req.body;

    if (!action) {
      return res.status(400).json({ error: "Missing action" });
    }

    if (!email || !password) {
      return res.status(400).json({ error: "Missing email or password" });
    }

    const userKey = `user:${email.toLowerCase()}`;

    /* =========================================================
       LOGIN
    ========================================================= */
    if (action === "login") {
      const user = await kv.get(userKey);
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const token = signToken({ email });
      const { password: _, ...safeUser } = user;

      return res.status(200).json({
        ok: true,
        token,
        user: safeUser,
      });
    }

    /* =========================================================
       SIGNUP
    ========================================================= */
    if (action === "signup") {
      const existing = await kv.get(userKey);
      if (existing) {
        return res.status(409).json({ error: "User already exists" });
      }

      const hashed = await bcrypt.hash(password, 10);

      await kv.set(userKey, {
        email,
        password: hashed,
        createdAt: Date.now(),
      });

      return res.status(200).json({ ok: true });
    }

    return res.status(400).json({ error: "Invalid action" });
  } catch (err) {
    console.error("AUTH API ERROR:", err);
    return res.status(500).json({ error: "Server error" });
  }
}
