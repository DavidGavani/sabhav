// Generates the Sabhav logo as real vector paths (no font dependency at runtime).
// Output:
//   public/logo.svg            horizontal lockup
//   public/logo-stacked.svg    stacked lockup
//   public/logo-mark.svg       arch monogram
//   public/favicon.svg         favicon
//   src/assets/logo.json       markup used by <Logo /> component
import opentype from "opentype.js";
import fs from "node:fs";

const FONT_DIR = "node_modules/@fontsource/cormorant-garamond/files";
const load = (f) => {
  const b = fs.readFileSync(`${FONT_DIR}/${f}`);
  return opentype.parse(b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength));
};
const regular = load("cormorant-garamond-latin-500-normal.woff");
const light = load("cormorant-garamond-latin-400-normal.woff");
const italic = load("cormorant-garamond-latin-400-italic.woff");

const f2 = (n) => Math.round(n * 100) / 100;

// Own path serializer: explicitly closes every contour (some renderers mis-fill unclosed TrueType contours).
function pathData(p) {
  let s = "";
  let open = false;
  for (const c of p.commands) {
    if (c.type === "M") {
      if (open) s += "Z";
      s += `M${f2(c.x)} ${f2(c.y)}`;
      open = true;
    } else if (c.type === "L") s += `L${f2(c.x)} ${f2(c.y)}`;
    else if (c.type === "Q") s += `Q${f2(c.x1)} ${f2(c.y1)} ${f2(c.x)} ${f2(c.y)}`;
    else if (c.type === "C") s += `C${f2(c.x1)} ${f2(c.y1)} ${f2(c.x2)} ${f2(c.y2)} ${f2(c.x)} ${f2(c.y)}`;
    else if (c.type === "Z") {
      s += "Z";
      open = false;
    }
  }
  if (open) s += "Z";
  return s;
}

/** Build tracked text as a single path. Returns { d, x1, x2, y1, y2 } relative to origin (0,0 = baseline-left). */
function trackedPath(font, text, size, tracking) {
  let x = 0;
  const ds = [];
  let bb = { x1: Infinity, y1: Infinity, x2: -Infinity, y2: -Infinity };
  for (const ch of text) {
    const p = font.getPath(ch, x, 0, size);
    ds.push(pathData(p));
    if (ch !== " ") {
      const b = p.getBoundingBox();
      bb.x1 = Math.min(bb.x1, b.x1);
      bb.y1 = Math.min(bb.y1, b.y1);
      bb.x2 = Math.max(bb.x2, b.x2);
      bb.y2 = Math.max(bb.y2, b.y2);
    }
    x += font.getAdvanceWidth(ch, size) + tracking * size;
  }
  return { d: ds.join(" "), ...bb };
}

const translate = (d, dx, dy) => `<path transform="translate(${f2(dx)} ${f2(dy)})" d="${d}"/>`;

// ---------- Monogram (arch + S) ----------
const MARK_W = 100;
const MARK_H = 132;
const sGlyph = trackedPath(regular, "S", 74, 0);
const sw = sGlyph.x2 - sGlyph.x1;
const sh = sGlyph.y2 - sGlyph.y1;
const sx = 50 - sw / 2 - sGlyph.x1;
const sy = 74 - sh / 2 - sGlyph.y1;

const arches = `
  <path d="M5 127 V50 A45 45 0 0 1 95 50 V127 Z" fill="none" stroke="url(#__ID__)" stroke-width="1.6" stroke-linejoin="round"/>
  <path d="M12 120 V50 A38 38 0 0 1 88 50 V120 Z" fill="none" stroke="url(#__ID__)" stroke-width="0.7" stroke-linejoin="round"/>
`;
const markInner = `
  ${arches}
  <g fill="url(#__ID__)">${translate(sGlyph.d, sx, sy)}</g>
  <path d="M2 127 H98" stroke="url(#__ID__)" stroke-width="1.6" stroke-linecap="round"/>
`;

// ---------- Wordmark ----------
const WORD = trackedPath(regular, "SABHAV", 100, 0.34);
const wordW = WORD.x2 - WORD.x1;
const wordH = WORD.y2 - WORD.y1;
const wordInner = (ox = 0, oy = 0) =>
  `<g fill="url(#__ID__)">${translate(WORD.d, ox - WORD.x1, oy - WORD.y1)}</g>`;

// ---------- Sub line ----------
const SUB = trackedPath(light, "V. B SANJANA", 22, 0.5);
const subW = SUB.x2 - SUB.x1;
const subH = SUB.y2 - SUB.y1;
const subInner = (ox, oy) =>
  `<g fill="url(#__ID__)" opacity="0.9">${translate(SUB.d, ox - SUB.x1, oy - SUB.y1)}</g>`;

const defs = (id) => `
  <defs>
    <linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" style="stop-color:var(--g1,#F3E6BF)"/>
      <stop offset="0.5" style="stop-color:var(--g2,#C9A45F)"/>
      <stop offset="1" style="stop-color:var(--g3,#9A7432)"/>
    </linearGradient>
  </defs>`;

// ---------- Layouts ----------
const mark = { vb: `0 0 ${MARK_W} ${MARK_H}`, w: MARK_W, h: MARK_H, inner: markInner };

// Horizontal: mark (scaled) + wordmark + subline
const hScale = 0.62;
const hMarkW = MARK_W * hScale;
const hMarkH = MARK_H * hScale;
const wordScale = (hMarkH * 0.5) / wordH;
const wordWs = wordW * wordScale;
const wordHs = wordH * wordScale;
const subScaleH = Math.min((wordWs * 0.56) / subW, 9.5 / subH);
const subHs = subH * subScaleH;
const blockH = wordHs + 11 + subHs;
const topOff = (hMarkH - blockH) / 2;
const gap = 26;
const hTotalW = hMarkW + gap + wordWs;
const hTotalH = hMarkH;
const sc = (n) => Math.round(n * 10000) / 10000;
const horizontalInner = `
  <g transform="scale(${hScale})">${markInner}</g>
  <g transform="translate(${f2(hMarkW + gap)} ${f2(topOff)}) scale(${sc(wordScale)})">${wordInner(0, 0)}</g>
  <g transform="translate(${f2(hMarkW + gap)} ${f2(topOff + wordHs + 11)}) scale(${sc(subScaleH)})">${subInner(0, 0)}</g>
`;
const horizontal = { vb: `0 0 ${f2(hTotalW)} ${f2(hTotalH)}`, w: hTotalW, h: hTotalH, inner: horizontalInner };

// Compact: mark + wordmark only (for navigation)
const cWordScale = (hMarkH * 0.4) / wordH;
const cWordW = wordW * cWordScale;
const cWordH = wordH * cWordScale;
const compactInner = `
  <g transform="scale(${hScale})">${markInner}</g>
  <g transform="translate(${f2(hMarkW + 22)} ${f2((hMarkH - cWordH) / 2)}) scale(${sc(cWordScale)})">${wordInner(0, 0)}</g>
`;
const compact = { vb: `0 0 ${f2(hMarkW + 22 + cWordW)} ${f2(hMarkH)}`, w: hMarkW + 22 + cWordW, h: hMarkH, inner: compactInner };

// Stacked: mark above, wordmark below, subline
const stackWordScale = 150 / wordW;
const stackW = 190;
const stackWordH = wordH * stackWordScale;
const stackSubScale = Math.min(86 / subW, 7.5 / subH);
const stackSubW = subW * stackSubScale;
const stackSubH = subH * stackSubScale;
const stackTotalH = MARK_H + 22 + stackWordH + 12 + stackSubH;
const stackedInner = `
  <g transform="translate(${f2((stackW - MARK_W) / 2)} 0)">${markInner}</g>
  <g transform="translate(${f2((stackW - 150) / 2)} ${f2(MARK_H + 22)}) scale(${sc(stackWordScale)})">${wordInner(0, 0)}</g>
  <g transform="translate(${f2((stackW - stackSubW) / 2)} ${f2(MARK_H + 22 + stackWordH + 12)}) scale(${sc(stackSubScale)})">${subInner(0, 0)}</g>
`;
const stacked = { vb: `0 0 ${stackW} ${f2(stackTotalH)}`, w: stackW, h: stackTotalH, inner: stackedInner };

// Wordmark only
const wordOnly = {
  vb: `0 0 ${f2(wordW)} ${f2(wordH)}`,
  w: wordW,
  h: wordH,
  inner: wordInner(0, 0),
};

const svgFile = (v, bg) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${v.vb}" width="${f2(v.w)}" height="${f2(v.h)}">${bg ?? ""}${defs("sabhav-gold")}${v.inner.replaceAll("__ID__", "sabhav-gold")}</svg>\n`;

fs.mkdirSync("public", { recursive: true });
fs.mkdirSync("src/assets", { recursive: true });
fs.writeFileSync("public/logo.svg", svgFile(horizontal));
fs.writeFileSync("public/logo-stacked.svg", svgFile(stacked));
fs.writeFileSync("public/logo-mark.svg", svgFile(mark));

// Favicon: dark rounded square with gold mark
const favScale = 0.36;
const favW = MARK_W * favScale;
const favH = MARK_H * favScale;
const fav = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <rect width="64" height="64" rx="14" fill="#14100E"/>
  ${defs("sabhav-gold")}
  <g transform="translate(${f2((64 - favW) / 2)} ${f2((64 - favH) / 2)}) scale(${favScale})">${markInner.replaceAll("__ID__", "sabhav-gold")}</g>
</svg>\n`;
fs.writeFileSync("public/favicon.svg", fav);

fs.writeFileSync(
  "src/assets/logo.json",
  JSON.stringify(
    {
      defs: defs("__ID__"),
      mark: { vb: mark.vb, inner: mark.inner, ratio: mark.w / mark.h },
      horizontal: { vb: horizontal.vb, inner: horizontal.inner, ratio: horizontal.w / horizontal.h },
      compact: { vb: compact.vb, inner: compact.inner, ratio: compact.w / compact.h },
      stacked: { vb: stacked.vb, inner: stacked.inner, ratio: stacked.w / stacked.h },
      word: { vb: wordOnly.vb, inner: wordOnly.inner, ratio: wordOnly.w / wordOnly.h },
    },
    null,
    1
  )
);
console.log("logo built");
