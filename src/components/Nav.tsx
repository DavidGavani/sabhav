import { useEffect, useState } from "react";
import Logo from "./Logo";
import { useScrolled } from "../hooks";

const links = [
  { href: "#collections", label: "Collections" },
  { href: "#lookbook", label: "Lookbook" },
  { href: "#process", label: "Process" },
  { href: "#about", label: "About" },
  { href: "#contact", label: "Contact" },
];

export default function Nav() {
  const scrolled = useScrolled(60);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <header className={`nav ${scrolled || open ? "nav--solid" : ""}`}>
        <div className="nav__inner">
          <a href="#top" className="nav__logo" aria-label="Sabhav home" onClick={() => setOpen(false)}>
            <Logo variant="compact" height={46} />
          </a>

          <nav className="nav__links" aria-label="Primary">
            {links.map((l) => (
              <a key={l.href} href={l.href}>
                {l.label}
              </a>
            ))}
          </nav>

          <button
            className={`nav__toggle ${open ? "is-open" : ""}`}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
          >
            <span />
            <span />
          </button>
        </div>
      </header>

      {/* Rendered outside <header>: the header's backdrop-filter would otherwise trap this fixed layer. */}
      <div className={`nav__sheet ${open ? "is-open" : ""}`} aria-hidden={!open}>
        {links.map((l, i) => (
          <a key={l.href} href={l.href} onClick={() => setOpen(false)} style={{ transitionDelay: `${80 + i * 50}ms` }}>
            {l.label}
          </a>
        ))}
      </div>
    </>
  );
}
