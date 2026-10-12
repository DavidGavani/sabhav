import Logo from "./Logo";
import { site } from "../content";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <a href="#top" aria-label="Back to top">
          <Logo variant="stacked" height={132} />
        </a>
        <nav className="footer__links" aria-label="Footer">
          <a href="#collections">Collections</a>
          <a href="#lookbook">Lookbook</a>
          <a href="#process">Process</a>
          <a href="#about">About</a>
          <a href="#contact">Contact</a>
        </nav>
        <p className="footer__copy">
          © {site.year} {site.brand}. Designs by {site.designer}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
