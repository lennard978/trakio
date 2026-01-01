import fs from "fs";
import path from "path";

const LOCALES_DIR = path.join(process.cwd(), "src", "locales");

function readJSON(p) {
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

function flatten(obj, prefix = "", out = new Set()) {
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === "object" && !Array.isArray(v)) flatten(v, key, out);
    else out.add(key);
  }
  return out;
}

const base = "en";
const basePath = path.join(LOCALES_DIR, base, "translation.json");
const baseJson = readJSON(basePath);
const baseKeys = flatten(baseJson);

const locales = fs.readdirSync(LOCALES_DIR).filter((d) =>
  fs.statSync(path.join(LOCALES_DIR, d)).isDirectory()
);

let exitCode = 0;

for (const loc of locales) {
  if (loc === base) continue;
  const p = path.join(LOCALES_DIR, loc, "translation.json");
  if (!fs.existsSync(p)) {
    console.log(`[${loc}] missing translation.json`);
    exitCode = 1;
    continue;
  }
  const json = readJSON(p);
  const keys = flatten(json);

  const missing = [...baseKeys].filter((k) => !keys.has(k));
  if (missing.length) {
    console.log(`\n[${loc}] Missing ${missing.length} keys:`);
    missing.slice(0, 50).forEach((k) => console.log(`  - ${k}`));
    if (missing.length > 50) console.log(`  ...and ${missing.length - 50} more`);
    exitCode = 1;
  } else {
    console.log(`[${loc}] OK`);
  }
}

process.exit(exitCode);
