import fs from "fs";
import path from "path";

const SRC_DIR = path.join(process.cwd(), "src");

const STRING_REGEX = />([^<{][^<>{}]{2,})</g; // JSX text
const ATTR_REGEX = /(?:title|placeholder|aria-label)=["'`]([^"'`]+)["'`]/g;

const results = [];

function scanFile(file) {
  const content = fs.readFileSync(file, "utf8");

  let match;
  while ((match = STRING_REGEX.exec(content))) {
    const text = match[1].trim();
    if (shouldIgnore(text)) continue;

    results.push({
      file,
      text,
      type: "jsx-text"
    });
  }

  while ((match = ATTR_REGEX.exec(content))) {
    const text = match[1].trim();
    if (shouldIgnore(text)) continue;

    results.push({
      file,
      text,
      type: "jsx-attr"
    });
  }
}

function shouldIgnore(text) {
  return (
    text.length < 3 ||
    /^[0-9]+$/.test(text) ||
    /^[€$]/.test(text) ||
    text.includes("{") ||
    text === text.toUpperCase()
  );
}

function walk(dir) {
  for (const entry of fs.readdirSync(dir)) {
    const p = path.join(dir, entry);
    if (fs.statSync(p).isDirectory()) walk(p);
    else if (p.endsWith(".jsx") || p.endsWith(".tsx")) scanFile(p);
  }
}

walk(SRC_DIR);

fs.writeFileSync(
  "i18n-hardcoded-report.json",
  JSON.stringify(results, null, 2)
);

console.log(`✅ Found ${results.length} hard-coded strings`);
