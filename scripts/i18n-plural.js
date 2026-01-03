// scripts/i18n-plural.js
import path from "path";
import fs from "fs";
import { readJSON, REQUIRED_PLURALS } from "./i18n-utils.js";

const FILE = path.resolve("src/locales/en/translation.json");

const data = readJSON(FILE);
const groups = {};

for (const key of Object.keys(data)) {
  const m = key.match(/^(.*)_(one|other|zero|few|many)$/); // extensible
  if (!m) continue;
  const base = m[1];
  const form = m[2];
  groups[base] ||= {};
  groups[base][form] = true;
}

const errors = [];

for (const [base, forms] of Object.entries(groups)) {
  const missing = REQUIRED_PLURALS.filter((f) => !forms[f]);
  if (missing.length) {
    errors.push({ base, missing });
  }
}

if (errors.length) {
  console.error("❌ i18n pluralization errors\n");
  errors.forEach(({ base, missing }) =>
    console.error(`Missing [${missing.join(", ")}] for: ${base}`)
  );
  process.exit(1);
}

console.log("✅ i18n pluralization check passed");
