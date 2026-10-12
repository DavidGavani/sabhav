import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";

const dir = "assets/outfilts";
const files = fs
  .readdirSync(dir)
  .filter((f) => /\.(png|jpe?g)$/i.test(f))
  .sort();

const out = [];
for (const f of files) {
  try {
    const m = await sharp(path.join(dir, f)).metadata();
    const size = fs.statSync(path.join(dir, f)).size;
    out.push({ f, w: m.width, h: m.height, size, alpha: m.hasAlpha });
  } catch (e) {
    out.push({ f, error: String(e) });
  }
}
fs.writeFileSync("scripts/inspect.json", JSON.stringify(out, null, 1));
const buckets = {};
for (const o of out) {
  if (o.error) continue;
  const k = `${o.w}x${o.h}`;
  buckets[k] = (buckets[k] || 0) + 1;
}
console.log(Object.entries(buckets).sort((a, b) => b[1] - a[1]).slice(0, 25));
console.log("total", out.length);
