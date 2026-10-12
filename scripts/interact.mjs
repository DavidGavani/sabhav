// Dev helper: exercises filter, lightbox, atelier tabs and mobile menu. Usage: node scripts/interact.mjs
import { chromium } from "playwright-core";

const url = "http://127.0.0.1:5173/";
const browser = await chromium.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe" });
const errors = [];

// Desktop
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  page.on("pageerror", (e) => errors.push(String(e)));
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  await page.goto(url, { waitUntil: "networkidle" });

  // collection CTA sets filter + scrolls
  await page.click(".hero__index li:nth-child(2) a");
  await page.waitForTimeout(1800);
  const active = await page.textContent(".filter.is-active");
  console.log("active filter after hero link:", active);
  await page.screenshot({ path: "scripts/shots/i-filter.png" });

  // lightbox
  await page.click(".masonry .tile >> nth=1");
  await page.waitForTimeout(1200);
  await page.screenshot({ path: "scripts/shots/i-lightbox.png" });
  await page.keyboard.press("ArrowRight");
  await page.waitForTimeout(800);
  console.log("caption:", await page.textContent(".lightbox__figure figcaption"));
  await page.keyboard.press("Escape");
  await page.waitForTimeout(300);
  console.log("lightbox closed:", (await page.$(".lightbox")) === null);

  // atelier last pair
  await page.evaluate(() => document.getElementById("atelier").scrollIntoView({ behavior: "instant" }));
  await page.waitForTimeout(600);
  await page.click(".atelier__item >> nth=5");
  await page.evaluate(() => window.scrollBy(0, 260));
  await page.waitForTimeout(1500);
  await page.screenshot({ path: "scripts/shots/i-atelier6.png" });

  // boards
  await page.evaluate(() => document.querySelector(".boards").scrollIntoView({ behavior: "instant" }));
  await page.waitForTimeout(1500);
  await page.screenshot({ path: "scripts/shots/i-boards.png" });

  // horizontal overflow check
  const ov = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  console.log("desktop horizontal overflow:", ov);
  await page.close();
}

// Mobile
{
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  page.on("pageerror", (e) => errors.push(String(e)));
  await page.goto(url, { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: "scripts/shots/m-hero.png" });
  await page.click(".nav__toggle");
  await page.waitForTimeout(900);
  await page.screenshot({ path: "scripts/shots/m-menu.png" });
  await page.click(".nav__sheet a >> nth=1");
  await page.waitForTimeout(1800);
  await page.screenshot({ path: "scripts/shots/m-lookbook.png" });
  const ov = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  console.log("mobile horizontal overflow:", ov);
  await page.close();
}

console.log("errors:", errors.length ? errors : "none");
await browser.close();
