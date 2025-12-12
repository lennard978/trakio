import bcrypt from "bcryptjs";
import { kvGet, kvSet } from "./kvAdapter";

export async function signup(req, res) {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ error: "Missing email or password" });
    }

    const userKey = `user:${email}`;

    const existing = await kvGet(userKey);
    if (existing) {
      return res.status(409).json({ error: "User already exists" });
    }

    const hash = await bcrypt.hash(password, 10);

    const user = {
      id: crypto.randomUUID(),
      email,
      passwordHash: hash,
      createdAt: Date.now(),
    };

    await kvSet(userKey, user);

    return res.status(201).json({ success: true });
  } catch (err) {
    console.error("SIGNUP CRASH:", err);
    return res.status(500).json({ error: "Signup failed" });
  }
}
export async function login(req, res) {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: "Missing credentials" });
    }

    const user = await kvGet(`user:${email}`);
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    return res.status(200).json({
      user: { id: user.id, email: user.email },
    });
  } catch (err) {
    console.error("LOGIN CRASH:", err);
    return res.status(500).json({ error: "Login failed" });
  }
}
