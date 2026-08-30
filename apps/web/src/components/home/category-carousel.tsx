"use client";

import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";
import type { MouseEvent } from "react";
import { useEffect, useRef, useState } from "react";

import type { CatalogCategory } from "@/features/catalog/domain/types";
import { cn } from "@/lib/utils/cn";

import { useInView } from "./use-in-view";

/**
 * One curated still per top-level category, keyed by slug. A category with no
 * entry simply shows the tinted ground with no photograph, so publishing a
 * fourth category in the CMS widens the carousel rather than breaking it.
 */
const PANEL_ART: Record<string, { objectPosition: string; src: string }> = {
  // Cropped low so each product rides above the band the copy sits in rather
  // than behind it.
  eyewear: { objectPosition: "50% 64%", src: "/brand/categories/eyewear.webp" },
  watches: { objectPosition: "50% 38%", src: "/brand/categories/watches.webp" },
  "writing-instruments": {
    objectPosition: "50% 50%",
    src: "/brand/categories/writing-instruments.webp",
  },
};

const ADVANCE_MS = 5_000;

export function CategoryCarousel({
  categories,
}: {
  categories: readonly CatalogCategory[];
}) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const stage = useRef<HTMLDivElement>(null);
  const inView = useInView(stage);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReducedMotion(query.matches);

    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  /**
   * Auto-advance is a convenience, never the only way through: every panel is a
   * focusable link and the dots below drive the same state. It stops while a
   * pointer or the keyboard is inside the carousel, waits until the section is
   * actually on screen, and never starts at all when the reader has asked for
   * reduced motion — so it can never yank a panel out from under someone
   * mid-read, nor spend the scroll down the page cycling unseen.
   */
  useEffect(() => {
    if (paused || reducedMotion || !inView || categories.length < 2) return;

    const timer = window.setInterval(() => {
      setActive((current) => (current + 1) % categories.length);
    }, ADVANCE_MS);

    return () => window.clearInterval(timer);
  }, [categories.length, inView, paused, reducedMotion]);

  if (categories.length === 0) return null;

  return (
    <div
      className="dx-cat-carousel"
      onBlurCapture={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      ref={stage}
    >
      <ul className="flex h-[38rem] list-none flex-col gap-2 p-0 md:h-[34rem] md:flex-row">
        {categories.map((category, index) => {
          const art = PANEL_ART[category.slug];
          const isActive = index === active;

          return (
            <li
              className="dx-cat-panel relative overflow-hidden rounded-2xl bg-obsidian"
              data-active={isActive}
              key={category.id}
            >
              {art ? (
                <Image
                  alt=""
                  className="dx-cat-art object-cover"
                  fill
                  sizes="(min-width: 768px) 62vw, 100vw"
                  src={art.src}
                  style={{ objectPosition: art.objectPosition }}
                />
              ) : null}

              {/*
                Two stacked washes. The gold one is brand colour, and is held
                back to the open panel — over a closed one it tinted the pale
                eyewear still olive rather than reading as warmth. The obsidian
                one is what earns the text its contrast, so it stays opaque
                across the band the copy sits in and clears the top of the frame
                where the product does.
              */}
              <div
                aria-hidden="true"
                className="dx-cat-glow absolute inset-0 bg-[radial-gradient(120%_75%_at_50%_0%,rgba(254,204,41,0.16)_0%,transparent_62%)]"
              />
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-t from-obsidian from-[42%] via-obsidian/25 via-[57%] to-transparent to-[76%]"
              />

              <Link
                aria-label={`${category.name} — ${category.description}`}
                className="absolute inset-0 flex flex-col justify-end p-5 text-porcelain outline-offset-[-3px] md:p-7"
                href={category.href as Route}
                onClick={(event: MouseEvent) => {
                  // First interaction opens the panel; the second follows the
                  // link. Without this a tap on a collapsed panel would navigate
                  // to a category the reader never actually got to look at.
                  if (!isActive) {
                    event.preventDefault();
                    setActive(index);
                  }
                }}
                onFocus={() => setActive(index)}
                onMouseEnter={() => setActive(index)}
              >
                {/* Collapsed state: the name alone, upright on mobile, turned on its side once the panels sit in a row. */}
                <span
                  aria-hidden="true"
                  className="dx-cat-tab absolute inset-0 flex items-center gap-3 p-5 font-display text-2xl leading-none md:justify-center md:p-0 md:[writing-mode:vertical-rl] md:rotate-180"
                >
                  {/*
                    Turned back upright: the tab itself is rotated a half turn
                    so the name reads bottom-to-top, and without this the digits
                    come out upside down inside it.
                  */}
                  <span className="text-[11px] font-semibold tracking-[0.18em] text-orbit-gold [writing-mode:horizontal-tb] md:rotate-180">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  {category.name}
                </span>

                {/* Expanded state. */}
                <span className="dx-cat-body block">
                  <span className="flex items-center gap-3 text-[11px] font-semibold tracking-[0.16em] text-orbit-gold">
                    {category.eyebrow}
                    <span
                      aria-hidden="true"
                      className="h-px flex-1 bg-orbit-gold/30"
                    />
                    <span className="text-porcelain/50">
                      {String(index + 1).padStart(2, "0")} /{" "}
                      {String(categories.length).padStart(2, "0")}
                    </span>
                  </span>

                  <span className="mt-3 block font-display text-[2.15rem] leading-[1.02] tracking-[-0.01em] md:text-[2.75rem]">
                    {category.name}
                  </span>

                  <span className="mt-3 block max-w-[26rem] text-sm leading-6 text-porcelain/75">
                    {category.description}
                  </span>

                  <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-orbit-gold">
                    Explore category
                    <svg
                      aria-hidden="true"
                      className="dx-cat-arrow size-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.75"
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="M5 12h14m0 0-6-6m6 6-6 6"
                        strokeLinecap="round"
                      />
                    </svg>
                  </span>
                </span>
              </Link>

              {/*
                Timer read-out for the panel currently open. Keyed on the active
                index so the fill restarts with each advance, and dropped
                entirely when nothing is advancing.
              */}
              {isActive &&
              !paused &&
              !reducedMotion &&
              categories.length > 1 ? (
                <span
                  aria-hidden="true"
                  className="absolute inset-x-0 bottom-0 h-0.5 bg-porcelain/10"
                >
                  <span
                    className="dx-cat-progress block h-full origin-left bg-orbit-gold"
                    key={active}
                  />
                </span>
              ) : null}
            </li>
          );
        })}
      </ul>

      {categories.length > 1 ? (
        <div className="mt-4 flex justify-center gap-1 md:justify-start">
          {categories.map((category, index) => (
            <button
              aria-label={`Show ${category.name}`}
              aria-pressed={index === active}
              className="group grid size-11 place-items-center rounded-full"
              key={category.id}
              onClick={() => setActive(index)}
              type="button"
            >
              <span
                className={cn(
                  "h-1 rounded-full transition-[width,background-color] duration-500",
                  index === active
                    ? "w-7 bg-obsidian"
                    : "w-3 bg-obsidian/25 group-hover:bg-obsidian/50",
                )}
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
