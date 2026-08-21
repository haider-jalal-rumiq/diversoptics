import Image from "next/image";

export function ProductMediaPlaceholder({
  compact = false,
}: {
  compact?: boolean;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-lg bg-porcelain ${compact ? "h-52" : "aspect-square"}`}
    >
      <div className="absolute inset-x-[24%] bottom-1/4 top-[14%]">
        <Image alt="" fill sizes="244px" src="/orbit/golden-orbit.svg" />
      </div>
      <div className="absolute inset-x-[30%] bottom-[32%] top-[21%]">
        <Image alt="" fill sizes="120px" src="/orbit/orbit-shadow.svg" />
      </div>
      <p className="absolute inset-x-4 bottom-5 text-center text-[10px] font-semibold tracking-[0.06em] text-smoke">
        CMS PRODUCT IMAGE
      </p>
    </div>
  );
}
