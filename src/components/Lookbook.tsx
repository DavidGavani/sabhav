import { useMemo, useState } from "react";
import { allLooks, collections, src, type Look } from "../content";
import { useColumns } from "../hooks";
import Lightbox from "./Lightbox";
import Reveal from "./Reveal";

type Props = { filter: string; onFilter: (slug: string) => void };

/** Distribute items into columns by shortest running height, keeping left-to-right reading order. */
function toColumns(looks: Look[], count: number): Look[][] {
  const cols: Look[][] = Array.from({ length: count }, () => []);
  const heights = new Array(count).fill(0);
  for (const look of looks) {
    let target = 0;
    for (let i = 1; i < count; i++) if (heights[i] < heights[target] - 0.001) target = i;
    cols[target].push(look);
    heights[target] += look.h / look.w;
  }
  return cols;
}

export default function Lookbook({ filter, onFilter }: Props) {
  const [active, setActive] = useState<number | null>(null);
  const columns = useColumns();

  const looks = useMemo(
    () => (filter === "all" ? allLooks : collections.find((c) => c.slug === filter)?.looks ?? allLooks),
    [filter]
  );
  const cols = useMemo(() => toColumns(looks, columns), [looks, columns]);
  const indexById = useMemo(() => new Map(looks.map((l, i) => [l.id, i])), [looks]);

  const items = useMemo(
    () =>
      looks.map((l) => ({
        id: l.id,
        w: l.w,
        h: l.h,
        color: l.color,
        alt: l.alt,
        caption: `${l.collectionTitle} · Look ${String(l.number).padStart(2, "0")}`,
      })),
    [looks]
  );

  const tabs = [{ slug: "all", title: "All", count: allLooks.length }].concat(
    collections.map((c) => ({ slug: c.slug, title: c.title, count: c.looks.length }))
  );

  return (
    <section className="section section--ink" id="lookbook">
      <div className="container">
        <Reveal className="section__head section__head--row">
          <div>
            <p className="eyebrow">The Lookbook</p>
            <h2 className="display">
              Every look, <em>in focus.</em>
            </h2>
          </div>
          <p className="section__lede">
            {looks.length} looks. Select any image to view it full size, then use the arrow keys or swipe to move through the set.
          </p>
        </Reveal>

        <div className="filters" role="tablist" aria-label="Filter looks by collection">
          {tabs.map((t) => (
            <button
              key={t.slug}
              role="tab"
              aria-selected={filter === t.slug}
              className={`filter ${filter === t.slug ? "is-active" : ""}`}
              onClick={() => onFilter(t.slug)}
            >
              {t.title}
              <sup>{t.count}</sup>
            </button>
          ))}
        </div>

        <div className="masonry" key={`${filter}-${columns}`}>
          {cols.map((col, ci) => (
            <div className="masonry__col" key={ci}>
              {col.map((look, i) => (
                <button
                  key={look.id}
                  className="tile"
                  style={{ animationDelay: `${Math.min(i * 60 + ci * 40, 500)}ms` }}
                  onClick={() => setActive(indexById.get(look.id) ?? 0)}
                  aria-label={`Open ${look.collectionTitle} look ${look.number}`}
                >
                  <img
                    src={src(look.id, 640)}
                    width={look.w}
                    height={look.h}
                    alt={look.alt}
                    loading="lazy"
                    decoding="async"
                    style={{ backgroundColor: look.color, aspectRatio: `${look.w} / ${look.h}` }}
                  />
                  <span className="tile__cap">
                    <span>{look.collectionTitle}</span>
                    Look {String(look.number).padStart(2, "0")}
                  </span>
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>

      <Lightbox items={items} index={active} onClose={() => setActive(null)} onIndex={setActive} />
    </section>
  );
}
