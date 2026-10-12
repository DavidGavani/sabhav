import { collections, src } from "../content";
import Reveal from "./Reveal";

export default function Collections({ onSelect }: { onSelect: (slug: string) => void }) {
  return (
    <section className="section section--ivory" id="collections">
      <div className="container">
        <Reveal className="section__head">
          <p className="eyebrow eyebrow--dark">The Collections</p>
          <h2 className="display">
            Four chapters, <em>one point of view.</em>
          </h2>
        </Reveal>

        <div className="collections">
          {collections.map((c, i) => (
            <article key={c.slug} className={`collection ${i % 2 ? "collection--flip" : ""}`}>
              <Reveal className="collection__cover">
                <a
                  href="#lookbook"
                  onClick={() => onSelect(c.slug)}
                  aria-label={`View ${c.title} looks`}
                  className="frame"
                >
                  <img
                    src={src(c.cover.id, 1400)}
                    width={c.cover.w}
                    height={c.cover.h}
                    alt={`${c.title} collection cover`}
                    loading="lazy"
                    decoding="async"
                    style={{ backgroundColor: c.cover.color }}
                  />
                </a>
              </Reveal>

              <Reveal className="collection__text" delay={120}>
                <span className="collection__n">0{i + 1}</span>
                <p className="eyebrow eyebrow--dark">{c.kicker}</p>
                <h3 className="collection__title">{c.title}</h3>
                <p className="collection__desc">{c.description}</p>
                <a className="link-arrow" href="#lookbook" onClick={() => onSelect(c.slug)}>
                  View {c.looks.length} looks <span aria-hidden>→</span>
                </a>
              </Reveal>

              <Reveal className="collection__accent" delay={240}>
                <div className="frame frame--plain">
                  <img
                    src={src(c.accent.id, 640)}
                    width={c.accent.w}
                    height={c.accent.h}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    style={{ backgroundColor: c.accent.color }}
                  />
                </div>
              </Reveal>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
