// scripts/fix-i18n.js
import fs from "fs";
import path from "path";
import {
  walk,
  extractKeys,
  readJSON,
  flatten
} from "./i18n-utils.js";

const SRC_DIR = path.resolve("src");
const LOCALES_DIR = path.resolve("src/locales");
const BASE_LANG = "en";
const BASE_DIR = path.join(LOCALES_DIR, BASE_LANG);
const BASE_FILE = path.join(BASE_DIR, "translation.json");
const COMPLETE_FILE = path.join(BASE_DIR, "en.complete.json");

if (!fs.existsSync(BASE_FILE)) {
  console.error(`❌ Missing base file:\n${BASE_FILE}`);
  process.exit(1);
}

const base = readJSON(BASE_FILE);
const baseKeys = new Set(Object.keys(base));

// Collect used translation keys
const usedKeys = new Set();
walk(SRC_DIR).forEach((file) => {
  const code = fs.readFileSync(file, "utf8");
  extractKeys(code).forEach((k) => usedKeys.add(k));
});

// Merge: add missing keys with placeholder
const merged = { ...base };
let added = 0;

[...usedKeys].sort().forEach((key) => {
  if (!merged[key]) {
    merged[key] = `TODO: ${key.replace(/_/g, " ")}`;
    added++;
  }
});

// Write updated and complete files
fs.writeFileSync(COMPLETE_FILE, JSON.stringify(merged, null, 2) + "\n", "utf8");
fs.writeFileSync(BASE_FILE, JSON.stringify(merged, null, 2) + "\n", "utf8");

// Report
console.log("✅ i18n fix complete");
console.log(`➕ Added ${added} missing keys`);
console.log(`📄 Updated: ${BASE_FILE}`);
console.log(`📄 Generated: ${COMPLETE_FILE}`);
