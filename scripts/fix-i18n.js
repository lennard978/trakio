// scripts/fix-i18n.js
import fs from "fs";
import path from "path";

const SRC_DIR = path.resolve("src");
const LOCALES_DIR = path.resolve("src/locales");
const BASE_LANG = "en";
const BASE_DIR = path.join(LOCALES_DIR, BASE_LANG);
const BASE_FILE = path.join(BASE_DIR, "translation.json");
const COMPLETE_FILE = path.join(BASE_DIR, "en.complete.json");

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
  console.error(`❌ Missing base file:\n${BASE_FILE}`);
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

// ---------------- merge ----------------
const merged = { ...base };
let added = 0;

[...usedKeys].sort().forEach((key) => {
  if (!merged[key]) {
    merged[key] = `TODO: ${key.replace(/_/g, " ")}`;
    added++;
  }
});

// ---------------- write outputs ----------------
fs.writeFileSync(
  COMPLETE_FILE,
  JSON.stringify(merged, null, 2) + "\n",
  "utf8"
);

fs.writeFileSync(
  BASE_FILE,
  JSON.stringify(merged, null, 2) + "\n",
  "utf8"
);

// ---------------- report ----------------
console.log("✅ i18n fix complete");
console.log(`➕ Added ${added} missing keys`);
console.log(`📄 Updated: src/locales/en/translation.json`);
console.log(`📄 Generated: src/locales/en/en.complete.json`);
