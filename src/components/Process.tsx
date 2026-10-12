import { useMemo, useState } from "react";
import { atelierPairs, processChapters, src, type ProcessImage } from "../content";
import Lightbox from "./Lightbox";
import Reveal from "./Reveal";

export default function Process() {
  const [chapter, setChapter] = useState(processChapters[0].slug);
  const [active, setActive] = useState<number | null>(null);
  const [pairI, setPairI] = useState(0);

  const current = processChapters.find((c) => c.slug === chapter) ?? processChapters[0];
  const pair = atelierPairs[pairI];
  const showPairs = chapter === "fashion-illustration";

  const items = useMemo(
    () =>
      current.images.map((im, i) => ({
        id: im.id,
        w: im.w,
        h: im.h,
        color: im.color,
        alt: im.alt,
        caption: `${current.title} · ${String(i + 1).padStart(2, "0")}`,
      })),
    [current]
  );

  return (
    <section className="section section--ivory" id="process">
      <div className="container">
        <Reveal className="section__head section__head--row">
          <div>
            <p className="eyebrow eyebrow--dark">The Process</p>
            <h2 className="display">
              From mood <em>to making.</em>
            </h2>
          </div>
          <p className="section__lede section__lede--dark">
            Mood boards, fashion illustrations, tech packs and pattern references — the working layers behind every Sabhav look.
          </p>
        </Reveal>

        <div className="process-tabs" role="tablist" aria-label="Process chapters">
          {processChapters.map((c) => (
            <button
              key={c.slug}
              role="tab"
              aria-selected={chapter === c.slug}
              className={`process-tab ${chapter === c.slug ? "is-active" : ""}`}
              onClick={() => {
                setChapter(c.slug);
                setActive(null);
              }}
            >
              <span className="process-tab__title">{c.title}</span>
              <span className="process-tab__count">{c.images.length}</span>
            </button>
          ))}
        </div>

        <Reveal className="process-intro" key={current.slug}>
          <p className="eyebrow eyebrow--dark">{current.kicker}</p>
          <h3 className="process-intro__title">{current.title}</h3>
          <p className="process-intro__desc">{current.description}</p>
        </Reveal>

        {showPairs && (
          <div className="atelier process-pairs">
            <Reveal className="atelier__list">
              <ol role="tablist" aria-label="Illustration to look">
                {atelierPairs.map((p, idx) => (
                  <li key={p.title}>
                    <button
                      role="tab"
                      aria-selected={idx === pairI}
                      className={`atelier__item ${idx === pairI ? "is-active" : ""}`}
                      onClick={() => setPairI(idx)}
                    >
                      <span className="atelier__n">0{idx + 1}</span>
                      <span className="atelier__t">{p.title}</span>
                    </button>
                  </li>
                ))}
              </ol>
              <p className="atelier__note" key={pair.title}>
                {pair.note}
              </p>
            </Reveal>

            <Reveal className="atelier__stage" delay={100}>
              {(
                [
                  { key: "s", label: "Illustration", img: pair.sketch, alt: `Illustration of ${pair.title}` },
                  { key: "f", label: "Finished look", img: pair.final, alt: `${pair.title}, finished look` },
                ] as const
              ).map(({ key, label, img, alt }) => (
                <figure className="atelier__panel" key={`${key}-${pairI}`}>
                  <div className="atelier__img" style={{ backgroundColor: img.color }}>
                    <img
                      src={src(img.id, 1400)}
                      width={img.w}
                      height={img.h}
                      alt={alt}
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                  <figcaption>{label}</figcaption>
                </figure>
              ))}
            </Reveal>
          </div>
        )}

        <div className={`process-grid ${current.slug === "tech-pack" || current.slug === "mood-board" ? "process-grid--wide" : ""}`} key={`grid-${current.slug}`}>
          {current.images.map((im: ProcessImage, i) => (
            <button
              key={im.id}
              className="process-card"
              style={{ animationDelay: `${Math.min(i * 50, 400)}ms` }}
              onClick={() => setActive(i)}
              aria-label={`Open ${current.title} ${i + 1}`}
            >
              <span className="process-card__media" style={{ backgroundColor: im.color, aspectRatio: `${im.w} / ${im.h}` }}>
                <img
                  src={src(im.id, current.slug === "tech-pack" || current.slug === "mood-board" ? 1400 : 640)}
                  width={im.w}
                  height={im.h}
                  alt={im.alt}
                  loading="lazy"
                  decoding="async"
                />
              </span>
              <span className="process-card__cap">
                <span>{current.title}</span>
                {String(i + 1).padStart(2, "0")}
              </span>
            </button>
          ))}
        </div>
      </div>

      <Lightbox items={items} index={active} onClose={() => setActive(null)} onIndex={setActive} />
    </section>
  );
}
