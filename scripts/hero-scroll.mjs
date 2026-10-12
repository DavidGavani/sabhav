import { chromium } from "playwright-core";
import fs from "node:fs";

fs.mkdirSync("scripts/shots", { recursive: true });
const browser = await chromium.launch({
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
});
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
page.on("pageerror", (e) => errors.push(String(e)));
await page.goto("http://127.0.0.1:5173/", { waitUntil: "networkidle" });
await page.waitForTimeout(1200);

const travel = await page.evaluate(() => {
  const el = document.querySelector(".hero");
  return el ? el.offsetHeight - window.innerHeight : 0;
});

for (const [name, t] of [
  ["h0", 0],
  ["h25", 0.25],
  ["h50", 0.5],
  ["h75", 0.75],
  ["h100", 1],
]) {
  await page.evaluate((y) => window.scrollTo(0, y), travel * t);
  await page.waitForTimeout(500);
  const p = await page.evaluate(() => document.querySelector(".hero__sticky")?.dataset.progress);
  console.log(name, "p=", p);
  await page.screenshot({ path: `scripts/shots/hero-${name}.png` });
}

// mobile start
const m = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
await m.goto("http://127.0.0.1:5173/", { waitUntil: "networkidle" });
await m.waitForTimeout(1000);
await m.screenshot({ path: "scripts/shots/hero-m0.png" });
const mt = await m.evaluate(() => {
  const el = document.querySelector(".hero");
  return el ? el.offsetHeight - window.innerHeight : 0;
});
await m.evaluate((y) => window.scrollTo(0, y), mt * 0.55);
await m.waitForTimeout(500);
await m.screenshot({ path: "scripts/shots/hero-m55.png" });

console.log("errors:", errors.length ? errors : "none");
await browser.close();
