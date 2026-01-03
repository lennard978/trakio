import fs from "fs";

const input = JSON.parse(
  fs.readFileSync("i18n-hardcoded-report.json", "utf8")
);

const existing = fs.existsSync("src/locales/en.json")
  ? JSON.parse(fs.readFileSync("src/locales/en.json", "utf8"))
  : {};

function toKey(text) {
  return (
    text
      .toLowerCase()
      .replace(/[^a-z0-9 ]/g, "")
      .trim()
      .replace(/\s+/g, "_")
      .slice(0, 40)
  );
}

for (const item of input) {
  const key = toKey(item.text);
  if (!existing[key]) {
    existing[key] = item.text;
  }
}

fs.writeFileSync(
  "src/locales/en.generated.json",
  JSON.stringify(existing, null, 2)
);

console.log("✅ en.generated.json created");
