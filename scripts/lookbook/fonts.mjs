import opentype from "opentype.js";
import fs from "node:fs";

const DIR = "node_modules/@fontsource/cormorant-garamond/files";
const cache = {};

function load(file) {
  if (!cache[file]) {
    const b = fs.readFileSync(`${DIR}/${file}`);
    cache[file] = opentype.parse(b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength));
  }
  return cache[file];
}

export const fonts = {
  light: () => load("cormorant-garamond-latin-300-normal.woff"),
  regular: () => load("cormorant-garamond-latin-400-normal.woff"),
  medium: () => load("cormorant-garamond-latin-500-normal.woff"),
  italic: () => load("cormorant-garamond-latin-400-italic.woff"),
};

const f2 = (n) => Math.round(n * 100) / 100;

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

/** Render text as SVG path group. baseline at (x,y). tracking is letter-spacing in em. */
export function textPath(font, text, x, y, size, { tracking = 0.08, fill = "#C2A063", anchor = "left", opacity = 1 } = {}) {
  let cursor = 0;
  const glyphs = [];
  for (const ch of text) {
    const adv = font.getAdvanceWidth(ch, size) + tracking * size;
    glyphs.push({ ch, x: cursor });
    cursor += adv;
  }
  const width = cursor;
  let ox = x;
  if (anchor === "center") ox = x - width / 2;
  if (anchor === "right") ox = x - width;
  const parts = [];
  for (const g of glyphs) {
    const p = font.getPath(g.ch, ox + g.x, y, size);
    const d = pathData(p);
    if (d) parts.push(`<path d="${d}" fill="${fill}" fill-opacity="${opacity}"/>`);
  }
  return { svg: parts.join(""), width, height: size };
}

export function svgOverlay(W, H, body) {
  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${body}</svg>`
  );
}
