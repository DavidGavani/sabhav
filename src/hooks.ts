import { useEffect, useRef, useState } from "react";

/** True once the element has entered the viewport (one-shot). */
export function useInView<T extends HTMLElement>(threshold = 0.15) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || inView) return;
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold, rootMargin: "0px 0px -6% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [inView, threshold]);

  return { ref, inView };
}

/** Number of masonry columns for the current viewport. */
export function useColumns() {
  const get = () => {
    if (typeof window === "undefined") return 3;
    const w = window.innerWidth;
    if (w < 640) return 2;
    if (w < 1100) return 3;
    if (w < 1600) return 4;
    return 5;
  };
  const [cols, setCols] = useState(get);
  useEffect(() => {
    const onResize = () => setCols(get());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return cols;
}

export function useScrolled(offset = 40) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > offset);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [offset]);
  return scrolled;
}

/** 0–1 progress of a sticky scroll track. Writes CSS vars onto the sticky node for paint-only animation. */
export function useStickyProgress<T extends HTMLElement>() {
  const trackRef = useRef<HTMLElement | null>(null);
  const stickyRef = useRef<T | null>(null);
  const reduced = useRef(false);

  useEffect(() => {
    reduced.current =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const sticky = stickyRef.current;
    if (!sticky) return;

    if (reduced.current) {
      sticky.style.setProperty("--p", "1");
      sticky.style.setProperty("--expand", "1");
      sticky.style.setProperty("--zoom", "1");
      sticky.style.setProperty("--brand", "1");
      sticky.style.setProperty("--settle", "1");
      sticky.style.setProperty("--cue", "0");
      sticky.dataset.progress = "1";
      return;
    }

    let raf = 0;
    const clamp = (n: number) => Math.min(1, Math.max(0, n));
    const ease = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
    const span = (p: number, a: number, b: number) => clamp((p - a) / (b - a));

    const tick = () => {
      raf = 0;
      const track = trackRef.current;
      const node = stickyRef.current;
      if (!track || !node) return;

      const rect = track.getBoundingClientRect();
      const travel = Math.max(1, track.offsetHeight - window.innerHeight);
      const p = clamp(-rect.top / travel);

      const expand = ease(span(p, 0.02, 0.55));
      const zoom = 1.22 - expand * 0.18;
      const brand = ease(span(p, 0.28, 0.72));
      const settle = ease(span(p, 0.55, 0.92));
      const cue = 1 - ease(span(p, 0.08, 0.35));

      node.style.setProperty("--p", p.toFixed(4));
      node.style.setProperty("--expand", expand.toFixed(4));
      node.style.setProperty("--zoom", zoom.toFixed(4));
      node.style.setProperty("--brand", brand.toFixed(4));
      node.style.setProperty("--settle", settle.toFixed(4));
      node.style.setProperty("--cue", cue.toFixed(4));
      node.dataset.progress = p.toFixed(3);
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };

    tick();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return { trackRef, stickyRef };
}
