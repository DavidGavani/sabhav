import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";
import { fonts, textPath, svgOverlay } from "./fonts.mjs";

export const W = 2000;
export const H = 2800;

const SRC = "assets/outfilts";
const inspect = JSON.parse(fs.readFileSync("scripts/inspect.json", "utf8")).filter((o) => !o.error);

export function srcFile(id) {
  const f = inspect[id]?.f;
  if (!f) throw new Error(`Missing image id ${id}`);
  return path.join(SRC, f);
}

export async function cover(id, { width, height, fit = "cover", position = "top" }) {
  return sharp(srcFile(id))
    .rotate()
    .resize(width, height, { fit, position })
    .jpeg({ quality: 90, mozjpeg: true })
    .toBuffer();
}

export async function blank(color = "#120E0C") {
  return sharp({ create: { width: W, height: H, channels: 3, background: color } })
    .jpeg({ quality: 92 })
    .toBuffer();
}

async function withOverlay(baseBuf, svgBody) {
  return sharp(baseBuf)
    .composite([{ input: svgOverlay(W, H, svgBody), top: 0, left: 0 }])
    .jpeg({ quality: 90, mozjpeg: true })
    .toBuffer();
}

const GOLD = "#C2A063";
const IVORY = "#F5EFE6";
const INK = "#120E0C";
const MUTED = "#A99D8F";

function hairline(x1, y1, x2, y2, color = GOLD, op = 0.7) {
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-opacity="${op}" stroke-width="1.2"/>`;
}

function rect(x, y, w, h, color, op = 1) {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${color}" fill-opacity="${op}"/>`;
}

/* -------------------------------------------------------------------------- */
/*  Page builders                                                              */
/* -------------------------------------------------------------------------- */

/** 01 — Full-bleed cover with arch-cropped look + brand */
export async function pageCover() {
  const bg = await cover(10, { width: W, height: H, position: "top" });
  const light = fonts.light();
  const med = fonts.medium();
  const brand = textPath(med, "SABHAV", W / 2, H * 0.78, 168, { tracking: 0.28, fill: GOLD, anchor: "center" });
  const sub = textPath(light, "FASHION DESIGN PORTFOLIO", W / 2, H * 0.78 + 70, 28, {
    tracking: 0.42,
    fill: IVORY,
    anchor: "center",
    opacity: 0.85,
  });
  const name = textPath(light, "V. B SANJANA", W / 2, H * 0.78 + 120, 26, {
    tracking: 0.38,
    fill: GOLD,
    anchor: "center",
  });
  const svg = [
    rect(0, H * 0.55, W, H * 0.45, INK, 0.55),
    hairline(W * 0.35, H * 0.78 - 90, W * 0.65, H * 0.78 - 90, GOLD, 0.6),
    brand.svg,
    sub.svg,
    name.svg,
    hairline(W * 0.42, H * 0.78 + 150, W * 0.58, H * 0.78 + 150, GOLD, 0.5),
  ].join("");
  return withOverlay(bg, svg);
}

/** 02 — Contents / index on ivory */
export async function pageContents() {
  const base = await blank(IVORY);
  const light = fonts.light();
  const med = fonts.medium();
  const italic = fonts.italic();
  const title = textPath(med, "Contents", W * 0.12, H * 0.22, 92, { tracking: 0.04, fill: INK });
  const items = [
    ["01", "Velvet Evenings"],
    ["02", "Bridal & Festive"],
    ["03", "Garden Hours"],
    ["04", "City Edit"],
    ["05", "Process"],
    ["06", "The Designer"],
  ];
  let body = title.svg + hairline(W * 0.12, H * 0.25, W * 0.4, H * 0.25, GOLD, 0.7);
  items.forEach(([n, t], i) => {
    const y = H * 0.34 + i * 110;
    body += textPath(italic, n, W * 0.12, y, 36, { tracking: 0.05, fill: GOLD }).svg;
    body += textPath(light, t.toUpperCase(), W * 0.22, y, 34, { tracking: 0.22, fill: INK }).svg;
    body += hairline(W * 0.12, y + 28, W * 0.88, y + 28, "#1A1411", 0.12);
  });
  // side image strip
  const strip = await cover(92, { width: Math.round(W * 0.34), height: H, position: "top" });
  const composed = await sharp(base)
    .composite([
      { input: strip, left: Math.round(W * 0.66), top: 0 },
      { input: svgOverlay(W, H, body), top: 0, left: 0 },
    ])
    .jpeg({ quality: 90, mozjpeg: true })
    .toBuffer();
  return composed;
}

/** 03 — Manifesto */
export async function pageManifesto() {
  const bg = await cover(22, { width: W, height: H, position: "attention" });
  const light = fonts.light();
  const italic = fonts.italic();
  const lines = [
    "Considered silhouettes.",
    "Saturated colour.",
    "Quiet craft.",
  ];
  let body = rect(0, 0, W, H, INK, 0.58);
  body += textPath(light, "SABHAV", W / 2, H * 0.28, 42, { tracking: 0.5, fill: GOLD, anchor: "center" }).svg;
  body += hairline(W * 0.42, H * 0.32, W * 0.58, H * 0.32);
  lines.forEach((line, i) => {
    body += textPath(italic, line, W / 2, H * 0.44 + i * 90, 64, {
      tracking: 0.02,
      fill: IVORY,
      anchor: "center",
    }).svg;
  });
  body += textPath(light, "CLOTHING BY V. B SANJANA", W / 2, H * 0.78, 24, {
    tracking: 0.36,
    fill: MUTED,
    anchor: "center",
  }).svg;
  return withOverlay(bg, body);
}

/** Collection opener — full bleed + chapter title */
export async function pageChapterOpen({ number, title, kicker, image }) {
  const bg = await cover(image, { width: W, height: H, position: "top" });
  const light = fonts.light();
  const med = fonts.medium();
  const italic = fonts.italic();
  const body = [
    rect(0, H * 0.62, W, H * 0.38, INK, 0.62),
    textPath(italic, number, W * 0.1, H * 0.72, 48, { fill: GOLD }).svg,
    textPath(med, title.toUpperCase(), W * 0.1, H * 0.8, 78, { tracking: 0.16, fill: IVORY }).svg,
    textPath(light, kicker.toUpperCase(), W * 0.1, H * 0.86, 24, { tracking: 0.32, fill: GOLD }).svg,
  ].join("");
  return withOverlay(bg, body);
}

/** Editorial diptych — two images + thin caption */
export async function pageDiptych({ left, right, caption, number }) {
  const gap = 28;
  const side = Math.round((W - gap * 3) / 2);
  const top = 220;
  const imgH = H - top - 280;
  const L = await cover(left, { width: side, height: imgH, position: "top" });
  const R = await cover(right, { width: side, height: imgH, position: "top" });
  const base = await blank(INK);
  const light = fonts.light();
  const italic = fonts.italic();
  const body = [
    textPath(italic, number, W * 0.08, 140, 32, { fill: GOLD }).svg,
    textPath(light, caption.toUpperCase(), W * 0.08, H - 140, 22, { tracking: 0.28, fill: MUTED }).svg,
    hairline(W * 0.08, H - 110, W * 0.4, H - 110, GOLD, 0.45),
  ].join("");
  return sharp(base)
    .composite([
      { input: L, left: gap, top },
      { input: R, left: gap * 2 + side, top },
      { input: svgOverlay(W, H, body), top: 0, left: 0 },
    ])
    .jpeg({ quality: 90, mozjpeg: true })
    .toBuffer();
}

/** Triptych — one tall + two stacked */
export async function pageTriptych({ hero, a, b, label }) {
  const pad = 40;
  const leftW = Math.round(W * 0.58);
  const rightW = W - leftW - pad * 3;
  const heroH = H - pad * 2;
  const half = Math.round((heroH - pad) / 2);
  const Hero = await cover(hero, { width: leftW, height: heroH, position: "top" });
  const A = await cover(a, { width: rightW, height: half, position: "top" });
  const B = await cover(b, { width: rightW, height: half, position: "top" });
  const base = await blank("#0C0908");
  const light = fonts.light();
  const body = textPath(light, label.toUpperCase(), pad, H - 50, 20, { tracking: 0.3, fill: GOLD }).svg;
  return sharp(base)
    .composite([
      { input: Hero, left: pad, top: pad },
      { input: A, left: pad * 2 + leftW, top: pad },
      { input: B, left: pad * 2 + leftW, top: pad * 2 + half },
      { input: svgOverlay(W, H, body), top: 0, left: 0 },
    ])
    .jpeg({ quality: 90, mozjpeg: true })
    .toBuffer();
}

/** Process — sketch beside finished look */
export async function pageProcessPair({ sketch, final, title, note }) {
  const pad = 80;
  const gap = 40;
  const col = Math.round((W - pad * 2 - gap) / 2);
  const imgH = Math.round(col * 1.4);
  const top = 380;
  const S = await cover(sketch, { width: col, height: imgH, fit: "contain", position: "centre" });
  // contain leaves letterbox — flatten on ivory panel
  const Sbox = await sharp({ create: { width: col, height: imgH, channels: 3, background: IVORY } })
    .composite([{ input: S, gravity: "centre" }])
    .jpeg()
    .toBuffer();
  const F = await cover(final, { width: col, height: imgH, position: "top" });
  const base = await blank(IVORY);
  const light = fonts.light();
  const med = fonts.medium();
  const italic = fonts.italic();
  const body = [
    textPath(light, "PROCESS", pad, 160, 22, { tracking: 0.4, fill: GOLD }).svg,
    textPath(med, title, pad, 250, 64, { tracking: 0.02, fill: INK }).svg,
    textPath(italic, note, pad, 310, 28, { tracking: 0.01, fill: "#6C5F55" }).svg,
    textPath(light, "ILLUSTRATION", pad, top + imgH + 50, 18, { tracking: 0.28, fill: "#6C5F55" }).svg,
    textPath(light, "FINISHED LOOK", pad + col + gap, top + imgH + 50, 18, { tracking: 0.28, fill: "#6C5F55" }).svg,
  ].join("");
  return sharp(base)
    .composite([
      { input: Sbox, left: pad, top },
      { input: F, left: pad + col + gap, top },
      { input: svgOverlay(W, H, body), top: 0, left: 0 },
    ])
    .jpeg({ quality: 90, mozjpeg: true })
    .toBuffer();
}

/** Mood / tech board — single board full page with margins */
export async function pageBoard({ image, kicker, title }) {
  const pad = 100;
  const imgW = W - pad * 2;
  const imgH = H - 420;
  const board = await cover(image, { width: imgW, height: imgH, fit: "contain", position: "centre" });
  const panel = await sharp({ create: { width: imgW, height: imgH, channels: 3, background: "#FFFFFF" } })
    .composite([{ input: board, gravity: "centre" }])
    .jpeg()
    .toBuffer();
  const base = await blank(IVORY);
  const light = fonts.light();
  const med = fonts.medium();
  const body = [
    textPath(light, kicker.toUpperCase(), pad, 140, 22, { tracking: 0.36, fill: GOLD }).svg,
    textPath(med, title, pad, 220, 56, { tracking: 0.04, fill: INK }).svg,
    hairline(pad, 250, pad + 180, 250, GOLD, 0.7),
  ].join("");
  return sharp(base)
    .composite([
      { input: panel, left: pad, top: 300 },
      { input: svgOverlay(W, H, body), top: 0, left: 0 },
    ])
    .jpeg({ quality: 90, mozjpeg: true })
    .toBuffer();
}

/** Selected looks — 6-image editorial grid (not a collage dump) */
export async function pageLookGrid({ images, title }) {
  const pad = 80;
  const gap = 24;
  const cols = 3;
  const rows = 2;
  const cellW = Math.floor((W - pad * 2 - gap * (cols - 1)) / cols);
  const cellH = Math.floor(cellW * 1.35);
  const gridH = cellH * rows + gap * (rows - 1);
  const top = Math.round((H - gridH) / 2 + 40);
  const comps = [];
  for (let i = 0; i < images.length && i < 6; i++) {
    const c = i % cols;
    const r = Math.floor(i / cols);
    const buf = await cover(images[i], { width: cellW, height: cellH, position: "top" });
    comps.push({ input: buf, left: pad + c * (cellW + gap), top: top + r * (cellH + gap) });
  }
  const base = await blank(INK);
  const light = fonts.light();
  const med = fonts.medium();
  const body = [
    textPath(light, "SELECTED LOOKS", pad, 140, 22, { tracking: 0.36, fill: GOLD }).svg,
    textPath(med, title, pad, 210, 52, { tracking: 0.06, fill: IVORY }).svg,
  ].join("");
  comps.push({ input: svgOverlay(W, H, body), top: 0, left: 0 });
  return sharp(base).composite(comps).jpeg({ quality: 90, mozjpeg: true }).toBuffer();
}

/** About */
export async function pageAbout() {
  const pad = 100;
  const portraitW = Math.round(W * 0.42);
  const portraitH = Math.round(portraitW * 1.45);
  // arch mask via SVG
  const photo = await cover(22, { width: portraitW, height: portraitH, position: "top" });
  const mask = Buffer.from(
    `<svg width="${portraitW}" height="${portraitH}"><rect x="0" y="0" width="${portraitW}" height="${portraitH}" rx="${portraitW / 2}" ry="${portraitW / 2}"/></svg>`
  );
  // simpler: rounded top arch using destination-in
  const arched = await sharp(photo)
    .composite([
      {
        input: Buffer.from(
          `<svg width="${portraitW}" height="${portraitH}" xmlns="http://www.w3.org/2000/svg">
            <defs><clipPath id="a"><path d="M0 ${portraitH} V${portraitW / 2} A${portraitW / 2} ${portraitW / 2} 0 0 1 ${portraitW} ${portraitW / 2} V${portraitH} Z"/></clipPath></defs>
            <rect width="100%" height="100%" fill="#fff" clip-path="url(#a)"/>
          </svg>`
        ),
        blend: "dest-in",
      },
    ])
    .png()
    .toBuffer();

  const base = await blank("#3A0F1A");
  const light = fonts.light();
  const med = fonts.medium();
  const italic = fonts.italic();
  const tx = pad + portraitW + 80;
  const body = [
    textPath(light, "THE DESIGNER", tx, 320, 22, { tracking: 0.36, fill: GOLD }).svg,
    textPath(med, "V. B Sanjana", tx, 420, 72, { tracking: 0.02, fill: IVORY }).svg,
    textPath(light, "FASHION DESIGNER  ·  FOUNDER OF SABHAV", tx, 480, 20, {
      tracking: 0.22,
      fill: GOLD,
    }).svg,
    textPath(
      italic,
      "Sabhav is a body of work built around",
      tx,
      600,
      30,
      { tracking: 0.01, fill: IVORY, opacity: 0.9 }
    ).svg,
    textPath(italic, "considered silhouettes, saturated colour", tx, 650, 30, {
      tracking: 0.01,
      fill: IVORY,
      opacity: 0.9,
    }).svg,
    textPath(italic, "and quiet craft — drawn first, then made.", tx, 700, 30, {
      tracking: 0.01,
      fill: IVORY,
      opacity: 0.9,
    }).svg,
    textPath(light, "SILHOUETTE", tx, 860, 20, { tracking: 0.28, fill: GOLD }).svg,
    textPath(light, "Structured bodices, long lines, movement.", tx, 910, 24, {
      tracking: 0.02,
      fill: MUTED,
    }).svg,
    textPath(light, "COLOUR", tx, 1000, 20, { tracking: 0.28, fill: GOLD }).svg,
    textPath(light, "Wine, plum, ivory — lifted by gold.", tx, 1050, 24, {
      tracking: 0.02,
      fill: MUTED,
    }).svg,
    textPath(light, "CRAFT", tx, 1140, 20, { tracking: 0.28, fill: GOLD }).svg,
    textPath(light, "Embroidery, appliqué, hand-finished detail.", tx, 1190, 24, {
      tracking: 0.02,
      fill: MUTED,
    }).svg,
  ].join("");

  return sharp(base)
    .composite([
      { input: arched, left: pad, top: Math.round((H - portraitH) / 2) },
      { input: svgOverlay(W, H, body), top: 0, left: 0 },
    ])
    .jpeg({ quality: 90, mozjpeg: true })
    .toBuffer();
}

/** Contact / closing */
export async function pageClose() {
  const bg = await cover(92, { width: W, height: H, position: "top" });
  const light = fonts.light();
  const med = fonts.medium();
  const body = [
    rect(0, 0, W, H, INK, 0.7),
    textPath(med, "SABHAV", W / 2, H * 0.4, 120, { tracking: 0.28, fill: GOLD, anchor: "center" }).svg,
    hairline(W * 0.4, H * 0.44, W * 0.6, H * 0.44),
    textPath(light, "V. B SANJANA", W / 2, H * 0.5, 28, { tracking: 0.36, fill: IVORY, anchor: "center" }).svg,
    textPath(light, "HELLO@SABHAV.COM", W / 2, H * 0.62, 26, {
      tracking: 0.28,
      fill: GOLD,
      anchor: "center",
    }).svg,
    textPath(light, "@SABHAV", W / 2, H * 0.68, 26, { tracking: 0.28, fill: MUTED, anchor: "center" }).svg,
    textPath(light, "COMMISSIONS  ·  COLLABORATIONS  ·  PRESS", W / 2, H * 0.82, 20, {
      tracking: 0.28,
      fill: MUTED,
      anchor: "center",
    }).svg,
  ].join("");
  return withOverlay(bg, body);
}

/** Full-bleed breath page — single image, almost no text */
export async function pageBleed({ image, whisper }) {
  const bg = await cover(image, { width: W, height: H, position: "attention" });
  if (!whisper) return bg;
  const light = fonts.light();
  const body = [
    rect(0, H * 0.9, W, H * 0.1, INK, 0.35),
    textPath(light, whisper.toUpperCase(), W * 0.08, H * 0.95, 20, { tracking: 0.32, fill: IVORY }).svg,
  ].join("");
  return withOverlay(bg, body);
}
