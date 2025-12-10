export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Missing email or password" });
    }

    const user = await kv.get(`user:${email}`);
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = signToken({ email });

    const { password: _, ...safeUser } = user;

    return res.status(200).json({ ok: true, token, user: safeUser });
  } catch (err) {
    console.error("LOGIN API ERROR:", err); // 👈 you’ll see this in Vercel logs
    return res.status(500).json({ error: "Server error" });
  }
}
