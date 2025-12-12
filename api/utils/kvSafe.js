import { kv } from "@vercel/kv";

export async function kvGet(key) {
  try {
    return await kv.get(key);
  } catch (e) {
    console.error("KV GET failed:", e);
    return null;
  }
}

export async function kvSet(key, value) {
  try {
    await kv.set(key, value);
    return true;
  } catch (e) {
    console.error("KV SET failed:", e);
    return false;
  }
}
