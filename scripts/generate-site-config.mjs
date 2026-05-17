#!/usr/bin/env node
/**
 * LINE友だち追加URLを site-config.js に書き出す
 *
 * 使い方（いずれか）:
 *   VITE_LINE_ADD_FRIEND_URL=https://lin.ee/xxxxx node scripts/generate-site-config.mjs
 *   LINE_CHANNEL_ACCESS_TOKEN=xxx node scripts/generate-site-config.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

/** ルートの .env を読み込む（dotenv 不要） */
const envPath = path.join(root, ".env");
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const val = trimmed.slice(eq + 1).trim();
    if (!process.env[key]) process.env[key] = val;
  }
}
const outPath = path.join(root, "js", "site-config.js");
const publicOut = path.join(root, "public", "js", "site-config.js");

function normalizeLineUrl(input) {
  const raw = (input || "").trim();
  if (!raw) return "";
  if (raw.startsWith("http")) return raw;
  if (raw.startsWith("@")) return `https://line.me/R/ti/p/${raw}`;
  return `https://line.me/R/ti/p/@${raw}`;
}

async function fetchFromLineApi(token) {
  const res = await fetch("https://api.line.me/v2/bot/info", {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`LINE API error ${res.status}: ${text}`);
  }
  const data = await res.json();
  const basicId = data.basicId;
  if (!basicId) {
    throw new Error("basicId が取得できませんでした");
  }
  return normalizeLineUrl(basicId);
}

async function main() {
  let url = normalizeLineUrl(
    process.env.VITE_LINE_ADD_FRIEND_URL ||
      process.env.LINE_ADD_FRIEND_URL ||
      ""
  );

  if (!url && process.env.LINE_CHANNEL_ACCESS_TOKEN) {
    console.log("LINE API から友だち追加URLを取得中…");
    url = await fetchFromLineApi(process.env.LINE_CHANNEL_ACCESS_TOKEN);
    console.log("取得:", url);
  }

  if (!url || url.includes("placeholder")) {
    console.error(`
エラー: LINE友だち追加URLが未設定です。

【方法1】n8n と同じチャネルのトークンで自動取得:
  LINE_CHANNEL_ACCESS_TOKEN=（n8nの環境変数と同じ値） npm run line:url

【方法2】LINE Official Account Manager の「友だち追加」URLを直接指定:
  VITE_LINE_ADD_FRIEND_URL=https://lin.ee/xxxxxxxx npm run line:url

【方法3】ベーシックID（@から始まるID）を指定:
  VITE_LINE_ADD_FRIEND_URL=@xxxxxxxx npm run line:url
`);
    process.exit(1);
  }

  const content = `/** 自動生成 — scripts/generate-site-config.mjs */\nwindow.SITE_CONFIG = {\n  LINE_ADD_FRIEND_URL: ${JSON.stringify(url)},\n  MAP: {\n    lat: 35.575413,\n    lng: 139.73526,\n    zoom: 19,\n    label: "エイト薬局本店",\n    address: "〒143-0012 東京都大田区大森東1-4-5 サワビル1階",\n  },\n};\n`;

  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, content);
  fs.mkdirSync(path.dirname(publicOut), { recursive: true });
  fs.writeFileSync(publicOut, content);
  console.log("書き出し完了:", outPath);
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
