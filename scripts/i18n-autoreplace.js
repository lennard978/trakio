import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const SRC = "src";

const cmd = `
npx jscodeshift \
  --parser=tsx \
  --extensions=jsx,tsx \
  --transform scripts/i18n-transform.js \
  ${SRC}
`;

console.log("🔁 Running i18n auto-replace...");
execSync(cmd, { stdio: "inherit" });
console.log("✅ i18n auto-replace done");
