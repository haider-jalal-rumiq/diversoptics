"use client";

import type { RefObject } from "react";
import { useEffect, useState } from "react";

/**
 * Whether the element is currently on screen.
 *
 * Both home carousels advance on a timer, and a timer that keeps firing for a
 * section nobody has scrolled to is pure waste: it repaints, it keeps the tab
 * busy, and it means the reader's first sight of the section is whatever slide
 * the clock happened to land on rather than the first one.
 *
 * Unlike `Reveal`, this observer stays connected — the answer has to keep
 * changing as the section leaves and re-enters. A browser without
 * IntersectionObserver is treated as "in view", so the carousel keeps working
 * rather than freezing on its first slide.
 */
export function useInView(ref: RefObject<HTMLElement | null>) {
  // Resolved up front rather than inside the effect: a browser with no observer
  // has to start out "in view", and setting that from the effect body would be
  // a cascading render. Nothing renders this value — it only gates a timer — so
  // the server and the client disagreeing about it costs no hydration mismatch.
  const [inView, setInView] = useState(
    () => typeof IntersectionObserver === "undefined",
  );

  useEffect(() => {
    const node = ref.current;
    if (!node || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) setInView(entry.isIntersecting);
      },
      { threshold: 0.25 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [ref]);

  return inView;
}
