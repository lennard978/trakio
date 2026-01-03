// scripts/i18n-strict.js
import path from "path";
import fs from "fs";
import { isInvalid, readJSON } from "./i18n-utils.js";

const FILE = path.resolve("src/locales/en/translation.json");

if (!fs.existsSync(FILE)) {
  console.error("❌ translation.json not found");
  process.exit(1);
}

const data = readJSON(FILE);
const bad = [];

for (const [key, value] of Object.entries(data)) {
  if (isInvalid(value)) {
    bad.push(key);
  }
}

if (bad.length) {
  console.error("❌ i18n strict check failed");
  console.error(`Found ${bad.length} invalid translations:\n`);
  bad.forEach((k) => console.error(" -", k));
  process.exit(1);
}

console.log("✅ i18n strict check passed");
