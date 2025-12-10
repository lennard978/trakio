// src/pages/api/user/cancel-trial.js
import { kv } from "@vercel/kv";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  try {
    const userKey = `user:${email}`;
    const user = await kv.get(userKey);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Only delete trial-related fields (optional: remove trial metadata)
    const updatedUser = {
      ...user,
      trialEnds: null,
      status: user.status === "trial" ? null : user.status, // clear trial status
    };

    await kv.set(userKey, updatedUser);

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("Cancel trial error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
