import { cn } from "@/lib/utils/cn";

const styles: Record<string, string> = {
  active: "bg-signal-green/10 text-signal-green",
  archived: "bg-smoke/10 text-smoke",
  disabled: "bg-signal-red/10 text-signal-red",
  draft: "bg-antique-brass/10 text-brass-ink",
  published: "bg-signal-green/10 text-signal-green",
};

export function StatusBadge({ value }: { value: string }) {
  return (
    <span
      className={cn(
        "inline-flex min-h-7 items-center rounded-full px-3 text-xs font-bold capitalize",
        styles[value] ?? "bg-smoke/10 text-smoke",
      )}
    >
      {value.replaceAll("_", " ")}
    </span>
  );
}
