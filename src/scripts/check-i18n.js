import fs from "fs";
import path from "path";

const LOCALES_DIR = "./src/i18n/locales";
const MASTER = "en.json";

const master = JSON.parse(
  fs.readFileSync(path.join(LOCALES_DIR, MASTER), "utf8")
);

const masterKeys = new Set(Object.keys(master));

console.log("🔎 i18n missing key check\n");

fs.readdirSync(LOCALES_DIR)
  .filter((f) => f.endsWith(".json") && f !== MASTER)
  .forEach((file) => {
    const locale = JSON.parse(
      fs.readFileSync(path.join(LOCALES_DIR, file), "utf8")
    );

    const keys = new Set(Object.keys(locale));
    const missing = [...masterKeys].filter((k) => !keys.has(k));

    if (missing.length) {
      console.log(`❌ ${file} is missing ${missing.length} keys`);
      missing.forEach((k) => console.log(`   - ${k}`));
      console.log("");
    } else {
      console.log(`✅ ${file} OK`);
    }
  });
