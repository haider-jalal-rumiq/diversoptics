import { cn } from "@/lib/utils/cn";

type AssetIconProps = {
  name: "heart" | "menu" | "message" | "search";
  className?: string;
  size?: number;
};

/**
 * Renders the exported Figma glyph as a CSS mask rather than an image, so it
 * takes the surrounding text colour.
 *
 * The source files are all stroked in obsidian, which is invisible on the green
 * WhatsApp button. Masking lets one asset serve both a dark header and a dark
 * button without shipping a second, lighter copy of every glyph.
 */
export function AssetIcon({ className, name, size = 24 }: AssetIconProps) {
  const mask = `url(/icons/${name}.svg) center / contain no-repeat`;

  return (
    <span
      aria-hidden="true"
      className={cn("block shrink-0 bg-current", className)}
      style={{
        WebkitMask: mask,
        height: size,
        mask,
        width: size,
      }}
    />
  );
}
