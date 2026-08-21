import { cn } from "@/lib/utils/cn";

export function SectionHeading({
  eyebrow,
  title,
  inverse = false,
  className,
}: {
  eyebrow: string;
  title: string;
  inverse?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("space-y-2", inverse && "text-porcelain", className)}>
      <p
        className={cn(
          "text-sm font-semibold tracking-[0.08em]",
          inverse && "text-orbit-gold",
        )}
      >
        {eyebrow}
      </p>
      <h2 className="max-w-[47.5rem] font-display text-[2.5rem] leading-[1.05] tracking-[-0.01em] sm:text-5xl">
        {title}
      </h2>
    </div>
  );
}
