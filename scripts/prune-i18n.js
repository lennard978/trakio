// scripts/prune-i18n.js
import fs from "fs";
import path from "path";
import {
  walk,
  extractKeys,
  readJSON
} from "./i18n-utils.js";

const SRC_DIR = path.resolve("src");
const LOCALES_DIR = path.resolve("src/locales");
const BASE_LANG = "en";
const BASE_FILE = path.join(LOCALES_DIR, BASE_LANG, "translation.json");

if (!fs.existsSync(BASE_FILE)) {
  console.error(`❌ translation.json not found:\n${BASE_FILE}`);
  process.exit(1);
}

const base = readJSON(BASE_FILE);
const baseKeys = new Set(Object.keys(base));

// Find used keys
const usedKeys = new Set();
walk(SRC_DIR).forEach((file) => {
  const code = fs.readFileSync(file, "utf8");
  extractKeys(code).forEach((k) => usedKeys.add(k));
});

// Identify unused keys
const unused = [...baseKeys].filter((k) => !usedKeys.has(k));

if (unused.length === 0) {
  console.log("✅ No unused translation keys found");
  process.exit(0);
}

// Backup before pruning
const backupFile = BASE_FILE.replace(/\.json$/, `.backup.${Date.now()}.json`);
fs.writeFileSync(backupFile, JSON.stringify(base, null, 2) + "\n", "utf8");

// Prune
const pruned = { ...base };
unused.forEach((k) => delete pruned[k]);
fs.writeFileSync(BASE_FILE, JSON.stringify(pruned, null, 2) + "\n", "utf8");

// Report
console.log("🧹 i18n prune complete");
console.log(`🗑️  Removed ${unused.length} unused keys`);
console.log(`💾 Backup created: ${path.basename(backupFile)}`);
unused.slice(0, 20).forEach((k) => console.log("  -", k));
if (unused.length > 20) {
  console.log(`  … +${unused.length - 20} more`);
}
