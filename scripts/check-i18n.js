#!/usr/bin/env node

import fs from "fs";
import path from "path";

const SRC_DIR = path.resolve("src");
const LOCALE_FILE = path.resolve("src/i18n/locales/en.json");

const T_REGEX = /\bt\s*\(\s*["'`]([^"'`]+)["'`]/g;
const FILE_REGEX = /\.(js|jsx|ts|tsx)$/;

// ---------- helpers ----------
function walk(dir, files = []) {
  if (!fs.existsSync(dir)) return files;

  for (const entry of fs.readdirSync(dir)) {
    const full = path.join(dir, entry);
    const stat = fs.statSync(full);

    if (stat.isDirectory()) walk(full, files);
    else if (FILE_REGEX.test(full)) files.push(full);
  }
  return files;
}

function extractKeysFromFile(file) {
  const content = fs.readFileSync(file, "utf8");
  const keys = [];
  let match;
  while ((match = T_REGEX.exec(content))) {
    keys.push(match[1]);
  }
  return keys;
}

function flatten(obj, prefix = "", res = {}) {
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (typeof v === "object" && v !== null) {
      flatten(v, key, res);
    } else {
      res[key] = v;
    }
  }
  return res;
}

// ---------- run ----------
if (!fs.existsSync(LOCALE_FILE)) {
  console.error("❌ en.json not found:", LOCALE_FILE);
  process.exit(1);
}

const locale = JSON.parse(fs.readFileSync(LOCALE_FILE, "utf8"));
const localeKeys = Object.keys(flatten(locale));

const files = walk(SRC_DIR);
const usedKeys = new Set();

files.forEach((file) => {
  extractKeysFromFile(file).forEach((k) => usedKeys.add(k));
});

const missing = [...usedKeys].filter((k) => !localeKeys.includes(k));
const unused = localeKeys.filter((k) => !usedKeys.has(k));

// ---------- report ----------
console.log("\n🌍 i18n CHECK RESULT\n");

if (missing.length) {
  console.log("❌ Missing keys:");
  missing.sort().forEach((k) => console.log("  -", k));
} else {
  console.log("✅ No missing keys");
}

console.log("");

if (unused.length) {
  console.log("⚠️  Unused keys:");
  unused.sort().forEach((k) => console.log("  -", k));
} else {
  console.log("✅ No unused keys");
}

if (missing.length) {
  console.log("\n❌ i18n check failed");
  process.exit(1);
} else {
  console.log("\n✅ i18n check passed");
}
