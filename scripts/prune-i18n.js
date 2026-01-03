// scripts/prune-i18n.js
import fs from "fs";
import path from "path";

const SRC_DIR = path.resolve("src");
const LOCALES_DIR = path.resolve("src/locales");
const BASE_LANG = "en";
const BASE_FILE = path.join(LOCALES_DIR, BASE_LANG, "translation.json");

const FILE_EXT = /\.(js|jsx|ts|tsx)$/;

// ---------------- helpers ----------------
function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir)) {
    const full = path.join(dir, entry);
    if (fs.statSync(full).isDirectory()) walk(full, files);
    else if (FILE_EXT.test(full)) files.push(full);
  }
  return files;
}

function extractKeys(code) {
  const keys = new Set();
  const regex = /\bt\(\s*["'`]([^"'`]+)["'`]/g;
  let m;
  while ((m = regex.exec(code))) {
    keys.add(m[1]);
  }
  return keys;
}

// ---------------- load base ----------------
if (!fs.existsSync(BASE_FILE)) {
  console.error(`❌ translation.json not found:\n${BASE_FILE}`);
  process.exit(1);
}

const base = JSON.parse(fs.readFileSync(BASE_FILE, "utf8"));
const baseKeys = new Set(Object.keys(base));

// ---------------- scan code ----------------
const usedKeys = new Set();
walk(SRC_DIR).forEach((file) => {
  const code = fs.readFileSync(file, "utf8");
  extractKeys(code).forEach((k) => usedKeys.add(k));
});

// ---------------- find unused ----------------
const unused = [...baseKeys].filter((k) => !usedKeys.has(k));

if (unused.length === 0) {
  console.log("✅ No unused translation keys found");
  process.exit(0);
}

// ---------------- backup ----------------
const backupFile =
  BASE_FILE.replace(/\.json$/, `.backup.${Date.now()}.json`);

fs.writeFileSync(
  backupFile,
  JSON.stringify(base, null, 2) + "\n",
  "utf8"
);

// ---------------- prune ----------------
const pruned = { ...base };
unused.forEach((k) => delete pruned[k]);

fs.writeFileSync(
  BASE_FILE,
  JSON.stringify(pruned, null, 2) + "\n",
  "utf8"
);

// ---------------- report ----------------
console.log("🧹 i18n prune complete");
console.log(`🗑️  Removed ${unused.length} unused keys`);
console.log(`💾 Backup created: ${path.basename(backupFile)}`);

unused.slice(0, 20).forEach((k) => {
  console.log("  -", k);
});

if (unused.length > 20) {
  console.log(`  … +${unused.length - 20} more`);
}
