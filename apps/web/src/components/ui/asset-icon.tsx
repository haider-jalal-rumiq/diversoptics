import Image from "next/image";

import { cn } from "@/lib/utils/cn";

type AssetIconProps = {
  name: "heart" | "menu" | "message" | "search";
  className?: string;
  size?: number;
};

export function AssetIcon({ className, name, size = 24 }: AssetIconProps) {
  return (
    <span
      aria-hidden="true"
      className={cn("relative block shrink-0", className)}
      style={{ width: size, height: size }}
    >
      <Image alt="" fill sizes={`${size}px`} src={`/icons/${name}.svg`} />
    </span>
  );
}
