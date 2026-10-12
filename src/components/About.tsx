import { about, aboutPortrait, site, src } from "../content";
import Reveal from "./Reveal";

export default function About() {
  return (
    <section className="section section--wine" id="about">
      <div className="container about">
        <Reveal className="about__figure">
          <div className="arch arch--sm">
            <img
              src={src(aboutPortrait.id, 1400)}
              width={aboutPortrait.w}
              height={aboutPortrait.h}
              alt="Burgundy and black gown with a sheer panel, by Sabhav"
              loading="lazy"
              decoding="async"
              style={{ backgroundColor: aboutPortrait.color }}
            />
          </div>
        </Reveal>

        <div className="about__copy">
          <Reveal>
            <p className="eyebrow">The Designer</p>
            <h2 className="display about__name">{about.heading}</h2>
            <p className="about__role">Fashion Designer · Founder of {site.brand}</p>
          </Reveal>

          <Reveal delay={100}>
            {about.paragraphs.map((p) => (
              <p className="about__p" key={p}>
                {p}
              </p>
            ))}
          </Reveal>

          <Reveal className="pillars" delay={200}>
            {about.pillars.map((p) => (
              <div className="pillar" key={p.title}>
                <h3>{p.title}</h3>
                <p>{p.text}</p>
              </div>
            ))}
          </Reveal>
        </div>
      </div>
    </section>
  );
}
