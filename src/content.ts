import curation from "./data/curation.json";
import manifest from "./data/manifest.json";

/* ------------------------------------------------------------------ */
/*  Edit the details below to update the site.                         */
/* ------------------------------------------------------------------ */
export const site = {
  designer: "V. B Sanjana",
  brand: "Sabhav",
  descriptor: "Clothing by V. B Sanjana",
  intro:
    "Considered silhouettes, saturated colour and quiet craft. Evening, bridal, day and ready-to-wear, drawn first, then made.",
  // TODO: replace with the real contact details.
  email: "hello@sabhav.com",
  instagramHandle: "@sabhav",
  instagramUrl: "https://instagram.com/sabhav",
  year: new Date().getFullYear(),
};

export const about = {
  heading: "V. B Sanjana",
  paragraphs: [
    "Sabhav is the clothing label of fashion designer V. B Sanjana: a body of work built around considered silhouettes, saturated colour and quiet craft.",
    "Every piece begins as a sketch. Proportion, drape and surface are resolved on paper, then translated into cloth, from corseted velvet gowns to easy garden dresses and sharp everyday separates.",
    "The palette runs warm: burgundy, plum, ivory and gold, with pastels and jewel tones for lighter moments. The through-line is a feminine, confident and modern point of view.",
  ],
  pillars: [
    { title: "Silhouette", text: "Structured bodices, long lines and movement in the hem." },
    { title: "Colour", text: "Wine, plum and ivory, lifted by gold and jewel tones." },
    { title: "Craft", text: "Embroidery, appliqué, beading and hand-finished detail." },
  ],
};

/* ------------------------------------------------------------------ */
/*  Image helpers                                                      */
/* ------------------------------------------------------------------ */
type ManifestEntry = { w: number; h: number; color: string };
const m = manifest as Record<string, ManifestEntry>;

export type Img = { id: number; w: number; h: number; color: string };

export function img(id: number): Img {
  const e = m[String(id)];
  if (!e) throw new Error(`Image ${id} missing from manifest. Run "npm run images".`);
  return { id, ...e };
}

export const src = (id: number, size: 640 | 1400 = 1400) =>
  `${import.meta.env.BASE_URL}images/${id}-${size}.webp`;

/* ------------------------------------------------------------------ */
/*  Collections                                                        */
/* ------------------------------------------------------------------ */
export type Look = Img & {
  collection: string;
  collectionTitle: string;
  number: number;
  alt: string;
};

export type Collection = {
  slug: string;
  title: string;
  kicker: string;
  description: string;
  cover: Img;
  accent: Img;
  looks: Look[];
};

export const collections: Collection[] = curation.collections.map((c) => ({
  slug: c.slug,
  title: c.title,
  kicker: c.kicker,
  description: c.description,
  cover: img(c.cover),
  accent: img(c.accent),
  looks: c.looks.map((id, i) => ({
    ...img(id),
    collection: c.slug,
    collectionTitle: c.title,
    number: i + 1,
    alt: `${c.title} look ${i + 1} by Sabhav`,
  })),
}));

/** All looks, interleaved across collections so the "All" view feels varied. */
export const allLooks: Look[] = (() => {
  const out: Look[] = [];
  const seen = new Set<number>();
  const max = Math.max(...collections.map((c) => c.looks.length));
  for (let i = 0; i < max; i++) {
    for (const c of collections) {
      const l = c.looks[i];
      if (l && !seen.has(l.id)) {
        seen.add(l.id);
        out.push(l);
      }
    }
  }
  return out;
})();

export const hero = img(curation.hero);
export const aboutPortrait = img(curation.aboutPortrait);
export const contactImage = img(curation.contactImage);

/* ------------------------------------------------------------------ */
/*  Atelier                                                            */
/* ------------------------------------------------------------------ */
export const atelierPairs = curation.atelier.pairs.map((p) => ({
  title: p.title,
  note: p.note,
  sketch: img(p.sketch),
  final: img(p.final),
}));

export const boards = curation.atelier.boards.map((id, i) => ({
  ...img(id),
  alt: `Sabhav design board ${i + 1}`,
}));

/* ------------------------------------------------------------------ */
/*  Process chapters                                                   */
/* ------------------------------------------------------------------ */
export type ProcessImage = Img & { alt: string };

export type ProcessChapter = {
  slug: string;
  title: string;
  kicker: string;
  description: string;
  images: ProcessImage[];
};

export const processChapters: ProcessChapter[] = curation.process.map((c) => ({
  slug: c.slug,
  title: c.title,
  kicker: c.kicker,
  description: c.description,
  images: c.images.map((id, i) => ({
    ...img(id),
    alt: `${c.title} ${i + 1} by Sabhav`,
  })),
}));
