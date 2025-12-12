let kv = null;

if (process.env.VERCEL) {
  const mod = await import("@vercel/kv");
  kv = mod.kv;
}

export async function kvGet(key) {
  if (!kv) return null;
  return kv.get(key);
}

export async function kvSet(key, value) {
  if (!kv) return null;
  return kv.set(key, value);
}
