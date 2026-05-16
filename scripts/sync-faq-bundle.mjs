import { copyFileSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const distAssets = "dist/assets";
const files = readdirSync(distAssets);

const jsFile = files.find((f) => f.startsWith("main-") && f.endsWith(".js"));
const cssFile = files.find((f) => f.startsWith("main-") && f.endsWith(".css"));

if (!jsFile || !cssFile) {
  console.error("FAQ bundle not found in dist/assets. Run vite build first.");
  process.exit(1);
}

copyFileSync(join(distAssets, jsFile), "js/faq-bundle.js");
copyFileSync(join(distAssets, cssFile), "css/faq-bundle.css");

const indexPath = "index.html";
let html = readFileSync(indexPath, "utf8");

html = html.replace(
  '<script type="module" src="/src/faq-entry.tsx"></script>',
  '<link rel="stylesheet" href="css/faq-bundle.css" />\n  <script type="module" src="js/faq-bundle.js"></script>',
);

writeFileSync(indexPath, html);
console.log(`Synced ${jsFile} -> js/faq-bundle.js`);
console.log(`Synced ${cssFile} -> css/faq-bundle.css`);
console.log("Updated index.html for static hosting");
