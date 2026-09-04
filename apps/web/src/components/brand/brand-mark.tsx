import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils/cn";

export function BrandMark({ className }: { className?: string }) {
  return (
    <Link
      aria-label="Diverso Optics home"
      className={cn("relative block h-12 w-[82px]", className)}
      href="/"
    >
      <Image
        alt="Diverso"
        className="object-contain"
        fill
        priority
        sizes="108px"
        src="/brand/diverso-logo-transparent.png"
      />
    </Link>
  );
}
