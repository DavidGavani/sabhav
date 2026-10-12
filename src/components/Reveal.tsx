import type { CSSProperties, ElementType, ReactNode } from "react";
import { useInView } from "../hooks";

type Props = {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  delay?: number;
  style?: CSSProperties;
};

/** Fades and lifts its children into view once. Respects prefers-reduced-motion via CSS. */
export default function Reveal({ children, as: Tag = "div", className = "", delay = 0, style }: Props) {
  const { ref, inView } = useInView<HTMLElement>();
  return (
    <Tag
      ref={ref}
      className={`reveal ${inView ? "is-in" : ""} ${className}`}
      style={{ ...style, transitionDelay: delay ? `${delay}ms` : undefined }}
    >
      {children}
    </Tag>
  );
}
