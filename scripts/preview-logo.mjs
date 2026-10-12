import sharp from "sharp";
import fs from "node:fs";
const fix = (s) => s.replace(/var\(--g1,(#[0-9A-Fa-f]+)\)/g, "$1").replace(/var\(--g2,(#[0-9A-Fa-f]+)\)/g, "$1").replace(/var\(--g3,(#[0-9A-Fa-f]+)\)/g, "$1");
const files = ["logo", "logo-stacked", "logo-mark", "favicon"];
const tiles = [];
let x = 0;
for (const f of files) {
  const svg = fix(fs.readFileSync(`public/${f}.svg`, "utf8"));
  const buf = await sharp(Buffer.from(svg), { density: 300 }).resize({ height: 420, width: f === "logo" ? 1000 : 460, fit: "contain", background: "#14100E" }).png().toBuffer();
  const m = await sharp(buf).metadata();
  tiles.push({ input: buf, left: x + 20, top: 20 });
  x += m.width + 20;
}
await sharp({ create: { width: x + 20, height: 460, channels: 3, background: "#14100E" } }).composite(tiles).png().toFile("scripts/logo-preview.png");
