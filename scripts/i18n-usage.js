// scripts/i18n-usage.js
import fs from "fs";
import path from "path";
import {
  walk,
  extractKeys,
  readJSON
} from "./i18n-utils.js";

const SRC = path.resolve("src");
const BASE = path.resolve("src/locales/en/translation.json");

const translations = readJSON(BASE);
const usage = {};
Object.keys(translations).forEach((k) => (usage[k] = []));

const usedButMissing = new Set();

walk(SRC).forEach((file) => {
  const code = fs.readFileSync(file, "utf8");
  extractKeys(code).forEach((key) => {
    if (usage[key]) {
      usage[key].push(file.replace(SRC, ""));
    } else {
      usedButMissing.add(key);
    }
  });
});

// Report
console.log("\n📍 i18n key usage report\n");

Object.entries(usage).forEach(([key, files]) => {
  if (!files.length) {
    console.log(`❌ UNUSED: ${key}`);
  } else {
    console.log(`✅ ${key}`);
    files.forEach((f) => console.log("   ↳", f));
  }
});

if (usedButMissing.size) {
  console.log("\n❗ Used but missing from translation.json:");
  [...usedButMissing].sort().forEach((k) => console.log("  -", k));
}
