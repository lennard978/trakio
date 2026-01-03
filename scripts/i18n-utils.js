// scripts/i18n-utils.js
import fs from "fs";
import path from "path";

export const FILE_EXT = /\.(js|jsx|ts|tsx)$/;

// Recursively collect all matching source files
export function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir)) {
    const full = path.join(dir, entry);
    if (fs.statSync(full).isDirectory()) walk(full, files);
    else if (FILE_EXT.test(full)) files.push(full);
  }
  return files;
}

// Extract keys from t("...") calls
export function extractKeys(code) {
  const keys = new Set();
  const regex = /\bt\s*\(\s*["'`]([^"'`]+)["'`]/g;
  let match;
  while ((match = regex.exec(code))) {
    keys.add(match[1]);
  }
  return keys;
}

// Flatten nested objects (i.e., JSON structure)
export function flatten(obj, prefix = "", out = new Set()) {
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === "object" && !Array.isArray(v)) {
      flatten(v, key, out);
    } else {
      out.add(key);
    }
  }
  return out;
}

// Load and parse JSON from file
export function readJSON(p) {
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

// Validate if translation string is invalid
export function isInvalid(value) {
  return (
    !value ||
    typeof value !== "string" ||
    value.trim() === "" ||
    /TODO|__MISSING__/i.test(value)
  );
}

// Required plural suffixes (extend per locale as needed)
export const REQUIRED_PLURALS = ["one", "other"];
