import { useState, type FormEvent } from "react";
import { contactImage, site, src } from "../content";
import Reveal from "./Reveal";

const topics = ["Commission", "Collaboration", "Press & styling", "Something else"];

export default function Contact() {
  const [sent, setSent] = useState(false);

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const name = String(f.get("name") ?? "");
    const email = String(f.get("email") ?? "");
    const topic = String(f.get("topic") ?? "");
    const message = String(f.get("message") ?? "");
    const subject = `${topic} enquiry for ${site.brand}`;
    const body = `${message}\n\n— ${name}\n${email}`;
    window.location.href = `mailto:${site.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setSent(true);
  };

  return (
    <section className="section section--ink contact" id="contact">
      <div className="contact__bg" aria-hidden>
        <img src={src(contactImage.id, 1400)} alt="" loading="lazy" decoding="async" />
      </div>
      <div className="container contact__grid">
        <Reveal className="contact__intro">
          <p className="eyebrow">Contact</p>
          <h2 className="display">
            Commissions, collaborations <em>and press.</em>
          </h2>
          <p className="contact__lede">
            For custom pieces, creative projects or any question about the collections, write to {site.designer} directly.
          </p>
          <dl className="contact__details">
            <div>
              <dt>Email</dt>
              <dd>
                <a href={`mailto:${site.email}`}>{site.email}</a>
              </dd>
            </div>
            <div>
              <dt>Instagram</dt>
              <dd>
                <a href={site.instagramUrl} target="_blank" rel="noreferrer">
                  {site.instagramHandle}
                </a>
              </dd>
            </div>
          </dl>
        </Reveal>

        <Reveal delay={120}>
          <form className="form" onSubmit={onSubmit}>
            <div className="form__row">
              <label>
                <span>Name</span>
                <input name="name" type="text" autoComplete="name" required />
              </label>
              <label>
                <span>Email</span>
                <input name="email" type="email" autoComplete="email" required />
              </label>
            </div>
            <label>
              <span>Enquiry</span>
              <select name="topic" defaultValue={topics[0]}>
                {topics.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </label>
            <label>
              <span>Message</span>
              <textarea name="message" rows={5} required />
            </label>
            <button type="submit" className="btn btn--gold">
              Send message
            </button>
            {sent && (
              <p className="form__note" role="status">
                Your email app should open with the message ready to send.
              </p>
            )}
          </form>
        </Reveal>
      </div>
    </section>
  );
}
