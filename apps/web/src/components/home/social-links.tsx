import type { ReactElement, SVGProps } from "react";

import { siteConfig, type SocialPlatform } from "@/lib/config/site";
import { cn } from "@/lib/utils/cn";

/**
 * Inline SVG rather than an icon package: three glyphs do not justify a
 * dependency, and inlining keeps them in the document instead of costing three
 * more requests on the critical path.
 */
const glyphs: Record<
  SocialPlatform,
  (props: SVGProps<SVGSVGElement>) => ReactElement
> = {
  facebook: (props) => (
    <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
      <path d="M14.05 21.5v-8.2h2.76l.41-3.2h-3.17V8.05c0-.93.26-1.56 1.59-1.56h1.69V3.63a22.7 22.7 0 0 0-2.47-.13c-2.44 0-4.11 1.49-4.11 4.23V10.1H7.98v3.2h2.77v8.2z" />
    </svg>
  ),
  instagram: (props) => (
    <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
      <path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.26.07 1.64.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.26.06-1.64.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41-.56-.22-.96-.48-1.38-.9a3.7 3.7 0 0 1-.9-1.38c-.16-.42-.36-1.06-.41-2.23-.06-1.26-.07-1.64-.07-4.85s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.42 2.17 8.8 2.16 12 2.16m0-2.16C8.74 0 8.33.01 7.05.07 5.78.13 4.9.33 4.14.63a5.9 5.9 0 0 0-2.13 1.38A5.9 5.9 0 0 0 .63 4.14c-.3.76-.5 1.64-.56 2.91C.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.06 1.27.26 2.15.56 2.91.3.79.72 1.46 1.38 2.13a5.9 5.9 0 0 0 2.13 1.38c.76.3 1.64.5 2.91.56C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c1.27-.06 2.15-.26 2.91-.56a5.9 5.9 0 0 0 2.13-1.38 5.9 5.9 0 0 0 1.38-2.13c.3-.76.5-1.64.56-2.91.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.06-1.27-.26-2.15-.56-2.91a5.9 5.9 0 0 0-1.38-2.13A5.9 5.9 0 0 0 19.86.63c-.76-.3-1.64-.5-2.91-.56C15.67.01 15.26 0 12 0" />
      <path d="M12 5.84a6.16 6.16 0 1 0 0 12.32 6.16 6.16 0 0 0 0-12.32m0 10.16a4 4 0 1 1 0-8 4 4 0 0 1 0 8" />
      <circle cx="18.41" cy="5.59" r="1.44" />
    </svg>
  ),
  tiktok: (props) => (
    <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
      <path d="M16.6 5.82A4.28 4.28 0 0 1 15.54 3h-3.09v12.4a2.59 2.59 0 0 1-2.59 2.5 2.59 2.59 0 0 1 0-5.18c.27 0 .53.04.77.12v-3.2a5.8 5.8 0 0 0-.77-.05A5.72 5.72 0 0 0 4.14 15.3 5.72 5.72 0 0 0 9.86 21a5.72 5.72 0 0 0 5.72-5.72V9.01a7.35 7.35 0 0 0 4.28 1.38V7.3a4.3 4.3 0 0 1-3.26-1.48" />
    </svg>
  ),
};

export function SocialLinks({
  className,
  tone = "dark",
}: {
  className?: string;
  tone?: "dark" | "light";
}) {
  return (
    <ul className={cn("flex list-none items-center gap-2 p-0", className)}>
      {siteConfig.social.map(({ href, label, name }) => {
        const Glyph = glyphs[name];
        const shell = cn(
          "grid size-11 place-items-center rounded-full border transition-[transform,background-color,border-color,color] duration-300 motion-safe:hover:-translate-y-0.5",
          tone === "dark"
            ? "border-porcelain/20 text-porcelain/70"
            : "border-obsidian/15 text-obsidian/60",
          href
            ? "hover:border-orbit-gold hover:bg-orbit-gold hover:text-obsidian"
            : "opacity-60",
        );

        return (
          <li key={name}>
            {href ? (
              <a
                aria-label={`Diverso Optics on ${label}`}
                className={shell}
                href={href}
                rel="noreferrer noopener"
                target="_blank"
              >
                <Glyph aria-hidden="true" className="size-[18px]" />
              </a>
            ) : (
              // No confirmed URL yet, so the glyph is decorative and the label
              // is what a screen reader announces.
              <span className={shell} title={`${label} — link coming soon`}>
                <Glyph aria-hidden="true" className="size-[18px]" />
                <span className="sr-only">{label}</span>
              </span>
            )}
          </li>
        );
      })}
    </ul>
  );
}
