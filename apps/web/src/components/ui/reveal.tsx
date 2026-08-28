"use client";

import type { CSSProperties, ReactNode } from "react";
import { useEffect, useRef } from "react";

import { cn } from "@/lib/utils/cn";

/**
 * Reveals its children once they scroll into view.
 *
 * An IntersectionObserver rather than a scroll listener, so the browser does the
 * work off the main thread and nothing runs on every frame. The observer is
 * disconnected on the first intersection: these reveals are one-way, and leaving
 * dozens of live observers on a long catalog page costs more than it returns.
 *
 * The resting offset lives in CSS behind a reduced-motion guard, and never hides
 * anything, so a session where this never runs still renders every section.
 */
export function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  /** Stagger, in milliseconds, for reveals that share a row. */
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    // The revealed state is a DOM attribute rather than React state on purpose.
    // Nothing in the tree reads it, so routing it through a re-render would cost
    // one per card for a value only CSS consumes.
    const show = () => {
      node.dataset.in = "true";
    };

    // Treat an unsupported observer as "already visible" rather than leaving the
    // section hidden behind a capability the browser does not have.
    if (typeof IntersectionObserver === "undefined") {
      show();
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        show();
        observer.disconnect();
      },
      // Fires slightly before the section reaches the viewport so the motion is
      // already settling by the time the reader gets to it.
      { rootMargin: "0px 0px -12% 0px", threshold: 0.05 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      className={cn("dx-reveal", className)}
      ref={ref}
      style={
        delay
          ? ({ "--dx-reveal-delay": `${delay}ms` } as CSSProperties)
          : undefined
      }
    >
      {children}
    </div>
  );
}
