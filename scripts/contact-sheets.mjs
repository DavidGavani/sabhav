import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";

const dir = "assets/outfilts";
const info = JSON.parse(fs.readFileSync("scripts/inspect.json", "utf8")).filter((o) => !o.error);
fs.mkdirSync("scripts/sheets", { recursive: true });

const per = 20, cols = 5, cw = 300, ch = 400;
for (let s = 0; s * per < info.length; s++) {
  const chunk = info.slice(s * per, s * per + per);
  const rows = Math.ceil(chunk.length / cols);
  const comps = [];
  for (let i = 0; i < chunk.length; i++) {
    const o = chunk[i];
    const buf = await sharp(path.join(dir, o.f))
      .resize(cw, ch, { fit: "contain", background: "#222" })
      .flatten({ background: "#222" })
      .jpeg({ quality: 70 })
      .toBuffer();
    const x = (i % cols) * cw, y = Math.floor(i / cols) * ch;
    comps.push({ input: buf, left: x, top: y });
    const label = Buffer.from(
      `<svg width="70" height="34" xmlns="http://www.w3.org/2000/svg"><rect width="70" height="34" fill="#000"/><text x="35" y="25" font-size="24" font-family="Arial" fill="#fff" text-anchor="middle">${s * per + i}</text></svg>`
    );
    comps.push({ input: label, left: x, top: y });
  }
  await sharp({ create: { width: cols * cw, height: rows * ch, channels: 3, background: "#111" } })
    .composite(comps)
    .jpeg({ quality: 70 })
    .toFile(`scripts/sheets/sheet-${s}.jpg`);
  console.log("sheet", s);
}
