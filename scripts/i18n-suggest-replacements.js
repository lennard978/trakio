import fs from "fs";

const entries = JSON.parse(
  fs.readFileSync("i18n-hardcoded-report.json", "utf8")
);

function key(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, "")
    .trim()
    .replace(/\s+/g, "_")
    .slice(0, 40);
}

for (const e of entries) {
  console.log(`
FILE: ${e.file}
REPLACE:
"${e.text}"
WITH:
{t("${key(e.text)}")}
`);
}
