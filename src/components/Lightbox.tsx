import { useCallback, useEffect, useRef, useState } from "react";
import { src } from "../content";

export type LightboxItem = {
  id: number;
  w: number;
  h: number;
  color: string;
  alt: string;
  caption?: string;
};

type Props = {
  items: LightboxItem[];
  index: number | null;
  onClose: () => void;
  onIndex: (i: number) => void;
};

export default function Lightbox({ items, index, onClose, onIndex }: Props) {
  const open = index !== null;
  const closeRef = useRef<HTMLButtonElement>(null);
  const touchX = useRef<number | null>(null);
  const [loaded, setLoaded] = useState(false);

  const go = useCallback(
    (dir: 1 | -1) => {
      if (index === null) return;
      onIndex((index + dir + items.length) % items.length);
    },
    [index, items.length, onIndex]
  );

  useEffect(() => {
    setLoaded(false);
  }, [index]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, go, onClose]);

  // Preload neighbours
  useEffect(() => {
    if (index === null) return;
    [1, -1].forEach((d) => {
      const n = items[(index + d + items.length) % items.length];
      if (n) {
        const i = new Image();
        i.src = src(n.id, 1400);
      }
    });
  }, [index, items]);

  if (index === null) return null;
  const item = items[index];
  if (!item) return null;

  return (
    <div
      className="lightbox"
      role="dialog"
      aria-modal="true"
      aria-label="Image viewer"
      onClick={onClose}
      onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchX.current === null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        touchX.current = null;
        if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
      }}
    >
      <button ref={closeRef} className="lightbox__btn lightbox__close" aria-label="Close" onClick={onClose}>
        <span />
        <span />
      </button>

      <button
        className="lightbox__btn lightbox__nav lightbox__nav--prev"
        aria-label="Previous image"
        onClick={(e) => {
          e.stopPropagation();
          go(-1);
        }}
      >
        ←
      </button>
      <button
        className="lightbox__btn lightbox__nav lightbox__nav--next"
        aria-label="Next image"
        onClick={(e) => {
          e.stopPropagation();
          go(1);
        }}
      >
        →
      </button>

      <figure className="lightbox__figure" onClick={(e) => e.stopPropagation()}>
        <img
          key={item.id}
          src={src(item.id, 1400)}
          alt={item.alt}
          className={loaded ? "is-loaded" : ""}
          style={{ backgroundColor: item.color, aspectRatio: `${item.w} / ${item.h}` }}
          onLoad={() => setLoaded(true)}
        />
        <figcaption>
          <span>{item.caption}</span>
          <span className="lightbox__count">
            {String(index + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}
          </span>
        </figcaption>
      </figure>
    </div>
  );
}
