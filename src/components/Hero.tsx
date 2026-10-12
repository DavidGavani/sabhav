import type { CSSProperties, Ref } from "react";
import { collections, hero, site, src } from "../content";
import { useStickyProgress } from "../hooks";

export default function Hero({ onSelect }: { onSelect: (slug: string) => void }) {
  const { trackRef, stickyRef } = useStickyProgress<HTMLDivElement>();

  return (
    <section className="hero" id="top" ref={trackRef as Ref<HTMLElement>}>
      <div
        className="hero__sticky"
        ref={stickyRef}
        style={
          {
            "--p": 0,
            "--expand": 0,
            "--zoom": 1.22,
            "--brand": 0,
            "--settle": 0,
            "--cue": 1,
          } as CSSProperties
        }
      >
        <div className="hero__glow" aria-hidden />
        <div className="hero__grain" aria-hidden />

        {/* Cinematic image: starts as arch, expands toward full-bleed */}
        <div className="hero__visual" aria-hidden={false}>
          <div className="hero__frame">
            <div className="hero__frame-ring" aria-hidden />
            <div className="hero__media">
              <img
                src={src(hero.id, 1400)}
                width={hero.w}
                height={hero.h}
                alt="Black velvet gown with a burgundy corseted bodice and high slit, by Sabhav"
                {...({ fetchpriority: "high" } as Record<string, string>)}
                style={{ backgroundColor: hero.color }}
              />
            </div>
          </div>
          <div className="hero__veil" aria-hidden />
        </div>

        {/* Brand wordmark — the primary scroll actor */}
        <div className="hero__brand">
          <p className="hero__eyebrow">Fashion Design Portfolio · {site.year}</p>
          <h1 className="hero__title" aria-label={site.brand}>
            <span>{site.brand}</span>
          </h1>
          <p className="hero__designer">
            <span className="hero__rule" aria-hidden />
            {site.descriptor}
          </p>
        </div>

        {/* Content that settles in after the visual opens */}
        <div className="hero__settle">
          <div className="container hero__settle-grid">
            <div className="hero__copy">
              <p className="hero__intro">{site.intro}</p>
              <div className="hero__cta">
                <a className="btn btn--gold" href="#collections">
                  View collections
                </a>
                <a className="btn btn--ghost" href="#contact">
                  Get in touch
                </a>
              </div>
              <ul className="hero__index" aria-label="Collections">
                {collections.map((c, i) => (
                  <li key={c.slug}>
                    <a
                      href="#lookbook"
                      onClick={() => onSelect(c.slug)}
                      aria-label={`${c.title}, ${c.looks.length} looks`}
                    >
                      <span className="hero__index-n">0{i + 1}</span>
                      {c.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <p className="hero__credit">
              <span>Look 01</span>
              Velvet Evenings
            </p>
          </div>
        </div>

        <div className="hero__cue" aria-hidden>
          <span>Scroll</span>
          <i />
        </div>

        <div className="hero__progress" aria-hidden>
          <span />
        </div>
      </div>
    </section>
  );
}
