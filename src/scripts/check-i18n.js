// scripts/check-i18n.js
import fs from "fs";
import path from "path";

const SRC_DIR = path.resolve("src");
const LOCALES_DIR = path.resolve("src/locales");
const BASE_LANG = "en";
const BASE_DIR = path.join(LOCALES_DIR, BASE_LANG);
const BASE_FILE = path.join(BASE_DIR, "translation.json");

const FILE_EXT = /\.(js|jsx|ts|tsx)$/;

// --- helpers ---
function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir)) {
    const full = path.join(dir, entry);
    if (fs.statSync(full).isDirectory()) walk(full, files);
    else if (FILE_EXT.test(full)) files.push(full);
  }
  return files;
}

function extractKeysFromSource(content) {
  const keys = new Set();

  // t("key"), t('key')
  const tRegex = /\bt\(\s*["'`]([^"'`]+)["'`]/g;
  let match;
  while ((match = tRegex.exec(content))) {
    keys.add(match[1]);
  }

  return keys;
}

// --- load base language ---
if (!fs.existsSync(BASE_FILE)) {
  console.error(`❌ Base translation file not found:\n${BASE_FILE}`);
  process.exit(1);
}

const baseTranslations = JSON.parse(fs.readFileSync(BASE_FILE, "utf8"));
const definedKeys = new Set(Object.keys(baseTranslations));

// --- scan source files ---
const sourceFiles = walk(SRC_DIR);
const usedKeys = new Set();

for (const file of sourceFiles) {
  const content = fs.readFileSync(file, "utf8");
  extractKeysFromSource(content).forEach(k => usedKeys.add(k));
}

// --- report missing keys ---
const missing = [...usedKeys].filter(k => !definedKeys.has(k));

if (missing.length === 0) {
  console.log("✅ i18n check passed — no missing keys");
  process.exit(0);
}

console.log("❌ Missing translation keys in en/translation.json:");
missing.sort().forEach(k => console.log("  -", k));
process.exit(1);
