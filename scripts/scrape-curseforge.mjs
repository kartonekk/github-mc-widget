// Scrapes download counts straight from CurseForge project pages with a real
// (headless) browser, since curseforge.com's Cloudflare protection blocks
// plain HTTP requests (curl/fetch get a 403) but passes a real browser.
//
// Run manually: node scripts/scrape-curseforge.mjs
// Run on a schedule via .github/workflows/scrape-curseforge.yml, which
// commits the resulting data/curseforge-downloads.json back to the repo —
// Vercel then auto-redeploys with the fresh numbers baked in.

import { chromium } from "playwright";
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECTS_PATH = path.join(__dirname, "..", "data", "curseforge-projects.json");
const OUTPUT_PATH = path.join(__dirname, "..", "data", "curseforge-downloads.json");

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36";

async function scrapeOne(page, { slug, category }) {
  const url = `https://www.curseforge.com/minecraft/${category}/${slug}`;
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });

  const downloadsText = await page.evaluate(() => {
    const dts = Array.from(document.querySelectorAll("dt"));
    const dt = dts.find((el) => el.textContent?.trim() === "Downloads");
    return dt?.nextElementSibling?.textContent?.trim() ?? null;
  });

  if (!downloadsText) throw new Error(`could not find a "Downloads" stat on ${url}`);

  const downloads = Number(downloadsText.replace(/,/g, ""));
  if (!Number.isFinite(downloads)) throw new Error(`unparsable downloads value "${downloadsText}" on ${url}`);

  return downloads;
}

async function loadExisting() {
  try {
    return JSON.parse(await readFile(OUTPUT_PATH, "utf8"));
  } catch {
    return {};
  }
}

async function main() {
  const projects = JSON.parse(await readFile(PROJECTS_PATH, "utf8"));
  const existing = await loadExisting();
  const results = { ...existing };

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ userAgent: USER_AGENT });

  for (const project of projects) {
    const key = `${project.category}/${project.slug}`;
    try {
      const downloads = await scrapeOne(page, project);
      results[key] = { ...project, downloads, updatedAt: new Date().toISOString() };
      console.log(`ok   ${key}: ${downloads} downloads`);
    } catch (err) {
      console.error(`fail ${key}: ${err.message}`);
      // Keep whatever we had before rather than losing data on a transient failure.
    }
  }

  await browser.close();
  await writeFile(OUTPUT_PATH, JSON.stringify(results, null, 2) + "\n");
  console.log(`wrote ${OUTPUT_PATH}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
