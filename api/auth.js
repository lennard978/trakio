import { kv } from "@vercel/kv";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";
import { signToken } from "./utils/jwt.js";

if (!process.env.JWT_SECRET) {
  throw new Error("Missing environment variable: JWT_SECRET");
}


async function rateLimit({ key, limit = 10, windowSeconds = 60 }) {
  // Sliding window is ideal, but a fixed window counter is sufficient for basic brute-force protection.
  const count = await kv.incr(key);
  if (count === 1) {
    await kv.expire(key, windowSeconds);
  }
  return count <= limit;
}

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const { action, email, password } = req.body || {};
    if (!action || !email || !password) {
      return res.status(400).json({ error: "Missing action, email, or password" });
    }

    const normalizedEmail = email.toLowerCase();
    const userKey = `user:${normalizedEmail}`;

    // LOGIN
    if (action === "login") {
      const ip = (req.headers["x-forwarded-for"] || "").split(",")[0].trim() || "unknown";
      const rlKey = `rl:login:${ip}:${normalizedEmail}`;
      const ok = await rateLimit({ key: rlKey, limit: 10, windowSeconds: 60 });
      if (!ok) return res.status(429).json({ error: "Too many attempts. Try again later." });
      const user = await kv.get(userKey);
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const token = signToken({
        userId: user.id,
        email: user.email,
      });

      const { password: _, ...safeUser } = user;

      return res.status(200).json({
        ok: true,
        token,
        user: safeUser,
      });
    }

    // SIGNUP
    if (action === "signup") {
      const ip = (req.headers["x-forwarded-for"] || "").split(",")[0].trim() || "unknown";
      const rlKey = `rl:signup:${ip}`;
      const ok = await rateLimit({ key: rlKey, limit: 5, windowSeconds: 60 });
      if (!ok) return res.status(429).json({ error: "Too many attempts. Try again later." });
      const existing = await kv.get(userKey);
      if (existing) {
        return res.status(409).json({ error: "User already exists" });
      }

      const hashed = await bcrypt.hash(password, 10);
      const userId = nanoid();

      const user = {
        id: userId,
        email: normalizedEmail,
        password: hashed,
        createdAt: Date.now(),
      };

      await kv.set(userKey, user);

      const token = signToken({
        userId,
        email: normalizedEmail,
      });

      const { password: _, ...safeUser } = user;

      return res.status(200).json({
        ok: true,
        token,
        user: safeUser,
      });
    }

    return res.status(400).json({ error: "Invalid action" });
  } catch (err) {
    console.error("AUTH API ERROR:", err);
    return res.status(500).json({ error: "Server error" });
  }
}
