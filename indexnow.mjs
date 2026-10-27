// Tells Bing (and the other IndexNow engines) that the sitemap's pages changed, so ChatGPT
// search and Copilot pick them up without waiting for a crawl. Run after a deploy: node indexnow.mjs
import { readFileSync, readdirSync } from "node:fs";

const HOST = "www.rosterbots.com";
const key = readdirSync(".").find(f => /^[0-9a-f]{32}\.txt$/.test(f)).slice(0, 32);
const urlList = [...readFileSync("sitemap.xml", "utf8").matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);

const res = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "content-type": "application/json; charset=utf-8" },
  body: JSON.stringify({ host: HOST, key, keyLocation: `https://${HOST}/${key}.txt`, urlList }),
});
console.log(`IndexNow: ${res.status} for ${urlList.length} pages`);
