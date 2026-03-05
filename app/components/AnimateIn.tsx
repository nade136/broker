"use client";

import { useRef, useEffect, useState, type ReactNode } from "react";

type Variant = "fade" | "up" | "left" | "right" | "scale";

const variantClass: Record<Variant, string> = {
  fade: "animate-in",
  up: "animate-in-up",
  left: "animate-in-left",
  right: "animate-in-right",
  scale: "animate-in-scale",
};

type Props = {
  children: ReactNode;
  variant?: Variant;
  delay?: 0 | 1 | 2 | 3 | 4 | 5;
  className?: string;
  as?: "div" | "section" | "article";
};

export default function AnimateIn({
  children,
  variant = "up",
  delay = 0,
  className = "",
  as: Tag = "div",
}: Props) {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setVisible(true);
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -40px 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const delayClass = delay > 0 ? `animate-delay-${delay}` : "";

    return (
    <Tag
      ref={ref as React.RefObject<HTMLDivElement & HTMLElement>}
      className={`animate-on-scroll ${visible ? variantClass[variant] : ""} ${delayClass} ${className}`}
    >
      {children}
    </Tag>
  );
}
