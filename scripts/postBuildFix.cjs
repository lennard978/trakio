const fs = require("fs");
const path = require("path");

const fse = require("fs-extra"); // Make sure to install this: npm install fs-extra

const distDir = path.join(__dirname, "../dist");
const targetDir = path.join(distDir, "subscription-tracker");

// Ensure target directory exists
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir);
}

// Files or folders to move
const filesToMove = ["404.html", "assets"];

filesToMove.forEach((item) => {
  const oldPath = path.join(distDir, item);
  const newPath = path.join(targetDir, item);

  try {
    if (fs.existsSync(oldPath)) {
      // Use copy instead of rename to avoid Windows EPERM error
      fse.copySync(oldPath, newPath, { overwrite: true });
      console.log(`Copied: ${item} → subscription-tracker/${item}`);

      // Optionally delete original (comment out if not needed)
      // fse.removeSync(oldPath);
    }
  } catch (err) {
    console.error(`❌ Failed to copy ${item}:`, err.message);
  }
});
