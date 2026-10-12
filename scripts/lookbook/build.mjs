/**
 * Sabhav — Luxury Fashion Design Portfolio Lookbook (PDF)
 * Generates editorial page composites from selected outfit images, then assembles a PDF.
 *
 * Usage: node scripts/lookbook/build.mjs
 * Output: dist/Sabhav_Portfolio_Lookbook.pdf
 *         scripts/lookbook/pages/*.jpg  (page previews)
 */
import fs from "node:fs";
import path from "node:path";
import { PDFDocument } from "pdf-lib";
import {
  pageCover,
  pageContents,
  pageManifesto,
  pageChapterOpen,
  pageDiptych,
  pageTriptych,
  pageProcessPair,
  pageBoard,
  pageLookGrid,
  pageAbout,
  pageClose,
  pageBleed,
  W,
  H,
} from "./compose.mjs";

const OUT_DIR = "scripts/lookbook/pages";
const PDF_PATH = "dist/Sabhav_Portfolio_Lookbook.pdf";

fs.mkdirSync(OUT_DIR, { recursive: true });
fs.mkdirSync("dist", { recursive: true });

const pages = [];

async function add(name, buf) {
  const file = path.join(OUT_DIR, `${String(pages.length + 1).padStart(2, "0")}-${name}.jpg`);
  fs.writeFileSync(file, buf);
  pages.push({ name, file, buf });
  console.log("✓", file);
}

console.log("Composing lookbook pages…\n");

await add("cover", await pageCover());
await add("contents", await pageContents());
await add("manifesto", await pageManifesto());

// Velvet Evenings
await add(
  "velvet-open",
  await pageChapterOpen({
    number: "01",
    title: "Velvet Evenings",
    kicker: "Evening & Occasion",
    image: 10,
  })
);
await add(
  "velvet-diptych",
  await pageDiptych({
    left: 15,
    right: 92,
    number: "01 — LOOKS",
    caption: "Velvet column  ·  Corseted evening",
  })
);
await add(
  "velvet-triptych",
  await pageTriptych({
    hero: 21,
    a: 22,
    b: 6,
    label: "Velvet Evenings — selected silhouettes",
  })
);

// Bridal
await add(
  "bridal-open",
  await pageChapterOpen({
    number: "02",
    title: "Bridal & Festive",
    kicker: "Lehenga · Saree · Couture",
    image: 70,
  })
);
await add(
  "bridal-diptych",
  await pageDiptych({
    left: 153,
    right: 58,
    number: "02 — LOOKS",
    caption: "Plum lehenga  ·  Rose drape",
  })
);

// Garden
await add(
  "garden-open",
  await pageChapterOpen({
    number: "03",
    title: "Garden Hours",
    kicker: "Day & Resort",
    image: 47,
  })
);
await add(
  "garden-bleed",
  await pageBleed({ image: 160, whisper: "Sage · Rosebud · Soft light" })
);

// City
await add(
  "city-open",
  await pageChapterOpen({
    number: "04",
    title: "City Edit",
    kicker: "Ready-to-wear",
    image: 2,
  })
);
await add(
  "city-triptych",
  await pageTriptych({
    hero: 18,
    a: 1,
    b: 81,
    label: "City Edit — modern separates",
  })
);

// Process
await add(
  "process-pair",
  await pageProcessPair({
    sketch: 155,
    final: 15,
    title: "Chocolate Velvet Column",
    note: "From croquis to finished silhouette.",
  })
);
await add(
  "mood-board",
  await pageBoard({
    image: 13,
    kicker: "Mood Board",
    title: "Direction & Atmosphere",
  })
);
await add(
  "tech-pack",
  await pageBoard({
    image: 57,
    kicker: "Tech Pack",
    title: "Fabric · Trim · Detail",
  })
);
await add(
  "pattern-sheet",
  await pageBoard({
    image: 0,
    kicker: "Pattern Making",
    title: "Cut & Construction",
  })
);

// Selected looks + about + close
await add(
  "selected",
  await pageLookGrid({
    title: "The Edit",
    images: [10, 70, 47, 2, 92, 160],
  })
);
await add("about", await pageAbout());
await add("close", await pageClose());

console.log(`\nAssembling PDF (${pages.length} pages)…`);

const pdf = await PDFDocument.create();
pdf.setTitle("Sabhav — Fashion Design Portfolio | V. B Sanjana");
pdf.setAuthor("V. B Sanjana");
pdf.setSubject("Luxury fashion design portfolio lookbook");
pdf.setCreator("Sabhav Portfolio");
pdf.setKeywords(["Sabhav", "fashion", "portfolio", "lookbook", "V. B Sanjana"]);

for (const p of pages) {
  const jpg = await pdf.embedJpg(p.buf);
  const page = pdf.addPage([W * 0.36, H * 0.36]); // points-ish scale for screen/print balance
  page.drawImage(jpg, { x: 0, y: 0, width: page.getWidth(), height: page.getHeight() });
}

const bytes = await pdf.save();
fs.writeFileSync(PDF_PATH, bytes);
const mb = (bytes.length / (1024 * 1024)).toFixed(2);
console.log(`\nDone → ${PDF_PATH} (${mb} MB, ${pages.length} pages)`);
console.log(`Page previews → ${OUT_DIR}/`);
