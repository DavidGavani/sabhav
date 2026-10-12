import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";

const SRC = "assets/outfilts";
const OUT = "public/images";
const SIZES = [640, 1400];

const curation = JSON.parse(fs.readFileSync("src/data/curation.json", "utf8"));
const inspect = JSON.parse(fs.readFileSync("scripts/inspect.json", "utf8")).filter((o) => !o.error);

const ids = new Set();
ids.add(curation.hero);
ids.add(curation.aboutPortrait);
ids.add(curation.contactImage);
for (const c of curation.collections) {
  ids.add(c.cover);
  ids.add(c.accent);
  c.looks.forEach((i) => ids.add(i));
}
for (const p of curation.atelier.pairs) {
  ids.add(p.sketch);
  ids.add(p.final);
}
curation.atelier.boards.forEach((i) => ids.add(i));
for (const chapter of curation.process ?? []) {
  chapter.images.forEach((i) => ids.add(i));
}

fs.mkdirSync(OUT, { recursive: true });

const manifest = {};
const list = [...ids].sort((a, b) => a - b);
let n = 0;
for (const id of list) {
  const file = inspect[id]?.f;
  if (!file) throw new Error(`No source for index ${id}`);
  const input = path.join(SRC, file);
  const meta = await sharp(input).metadata();
  const { dominant, channels } = await sharp(input).flatten({ background: "#ffffff" }).stats();
  const avg = channels.map((c) => Math.round(c.mean));
  const hex = "#" + avg.slice(0, 3).map((v) => v.toString(16).padStart(2, "0")).join("");
  manifest[id] = { w: meta.width, h: meta.height, color: hex };

  for (const size of SIZES) {
    const out = path.join(OUT, `${id}-${size}.webp`);
    if (fs.existsSync(out)) continue;
    await sharp(input)
      .flatten({ background: "#ffffff" })
      .resize({ width: size, withoutEnlargement: true })
      .webp({ quality: size > 800 ? 82 : 76, effort: 5 })
      .toFile(out);
  }
  n++;
  if (n % 10 === 0) console.log(`${n}/${list.length}`);
}

fs.writeFileSync("src/data/manifest.json", JSON.stringify(manifest, null, 1));
console.log(`Done: ${list.length} images -> ${OUT}`);
