// Dev helper: captures section screenshots for visual QA. Usage: node scripts/screenshots.mjs [url]
import { chromium } from "playwright-core";
import fs from "node:fs";

const url = process.argv[2] ?? "http://127.0.0.1:5173/";
fs.mkdirSync("scripts/shots", { recursive: true });

const browser = await chromium.launch({
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
});

async function run(name, viewport) {
  const page = await browser.newPage({ viewport });
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  await page.goto(url, { waitUntil: "networkidle" });
  await page.waitForTimeout(1800);
  await page.screenshot({ path: `scripts/shots/${name}-hero.png` });

  // scroll through to trigger reveals + lazy images
  const h = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < h; y += viewport.height * 0.6) {
    await page.evaluate((yy) => window.scrollTo(0, yy), y);
    await page.waitForTimeout(250);
  }
  await page.waitForTimeout(1200);

  for (const id of ["collections", "lookbook", "atelier", "about", "contact"]) {
    const el = await page.$(`#${id}`);
    await el.scrollIntoViewIfNeeded();
    await page.evaluate((i) => document.getElementById(i).scrollIntoView({ behavior: "instant" }), id);
    await page.waitForTimeout(1200);
    await page.screenshot({ path: `scripts/shots/${name}-${id}.png` });
  }
  console.log(name, "errors:", errors.length ? errors : "none");
  await page.close();
}

await run("desktop", { width: 1440, height: 900 });
await run("mobile", { width: 390, height: 844 });
await browser.close();
