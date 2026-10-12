import { useId } from "react";
import logo from "../assets/logo.json";

type Variant = "mark" | "horizontal" | "compact" | "stacked" | "word";

type Props = {
  variant?: Variant;
  /** CSS height of the rendered logo, e.g. 44 or "3rem" */
  height?: number | string;
  /** "dark" = gold on dark backgrounds (default). "light" = deeper gold for light backgrounds. */
  tone?: "dark" | "light";
  className?: string;
};

export default function Logo({ variant = "horizontal", height = 44, tone = "dark", className = "" }: Props) {
  const uid = "g" + useId().replace(/[^a-zA-Z0-9]/g, "");
  const v = logo[variant];
  const markup = (logo.defs + v.inner).replaceAll("__ID__", uid);

  return (
    <svg
      viewBox={v.vb}
      role="img"
      aria-label="Sabhav"
      className={`logo logo--${variant} ${tone === "light" ? "logo--onlight" : ""} ${className}`}
      style={{ height, aspectRatio: String(v.ratio) }}
      dangerouslySetInnerHTML={{ __html: markup }}
    />
  );
}
