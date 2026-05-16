#!/usr/bin/env node
/** ルートの js / css を public に同期（Vite build 時の上書き防止） */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const pairs = [
  ["js/main.js", "public/js/main.js"],
  ["js/site-config.js", "public/js/site-config.js"],
  ["css/styles.css", "public/css/styles.css"],
  ["design-tokens.css", "public/design-tokens.css"],
];

for (const [from, to] of pairs) {
  const src = path.join(root, from);
  const dest = path.join(root, to);
  if (!fs.existsSync(src)) {
    console.warn("skip (missing):", from);
    continue;
  }
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
}

console.log("public/ へ js・css を同期しました");
