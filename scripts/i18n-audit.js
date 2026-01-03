// scripts/i18n-coverage.js
import fs from "fs";
import path from "path";
import { readJSON, flatten } from "./i18n-utils.js";

const LOCALES_DIR = path.join(process.cwd(), "src", "locales");

// Optional: dynamic base locale
const baseArg = process.argv.find(arg => arg.startsWith("--base="));
const base = baseArg ? baseArg.split("=")[1] : "en";

const basePath = path.join(LOCALES_DIR, base, "translation.json");

if (!fs.existsSync(basePath)) {
  console.error(`❌ Base translation not found: ${basePath}`);
  process.exit(1);
}

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
  const extra = [...keys].filter((k) => !baseKeys.has(k));

  if (missing.length) {
    console.log(`\n[${loc}] ❌ Missing ${missing.length} keys:`);
    missing.slice(0, 50).forEach((k) => console.log(`  - ${k}`));
    if (missing.length > 50) console.log(`  ...and ${missing.length - 50} more`);
    exitCode = 1;
  } else {
    console.log(`[${loc}] ✅ No missing keys`);
  }

  if (extra.length) {
    console.log(`[${loc}] ⚠️  ${extra.length} extra keys not in base:`);
    extra.slice(0, 50).forEach((k) => console.log(`  + ${k}`));
    if (extra.length > 50) console.log(`  ...and ${extra.length - 50} more`);
  }
}

console.log("\n🔍 i18n coverage check complete");
if (exitCode === 0) {
  console.log("✅ All locales match base locale keys.");
} else {
  console.log("❌ Some locales are missing keys.");
}

process.exit(exitCode);
