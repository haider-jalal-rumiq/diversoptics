import Image from "next/image";

export function OrbitArtwork() {
  return (
    <div
      className="orbit-scene relative mx-auto aspect-square w-full max-w-80"
      aria-label="Static Golden Orbit product preview artwork"
      role="img"
    >
      <div className="absolute inset-6">
        <Image
          alt=""
          fill
          priority
          sizes="320px"
          src="/orbit/ring-primary.svg"
        />
      </div>
      <div className="absolute -right-[18%] -top-[14%] h-[90%] w-[70%] -rotate-[28deg]">
        <Image
          alt=""
          fill
          priority
          sizes="230px"
          src="/orbit/ring-secondary.svg"
        />
      </div>
      <div className="absolute -left-[13%] top-[22%] h-[55%] w-[95%] rotate-[18deg]">
        <Image alt="" fill priority sizes="300px" src="/orbit/ring-depth.svg" />
      </div>
      {/*
        Brand artwork rather than a product photograph, so it makes no claim
        about a specific item. Real hero photography replaces it once the shoot
        list in TASKS.md is done.
      */}
      <div className="absolute left-[13%] top-[26%] h-[48%] w-[74%] rotate-[5deg] overflow-hidden rounded-xl bg-porcelain shadow-2xl">
        <Image
          alt=""
          className="object-cover"
          fill
          priority
          sizes="(min-width: 1024px) 300px, 240px"
          src="/brand/hero-eyewear.webp"
        />
      </div>
      <span className="absolute left-[13%] top-[22%] size-2">
        <Image alt="" fill sizes="8px" src="/orbit/node-small.svg" />
      </span>
      <span className="absolute right-[12%] top-[17%] size-3">
        <Image alt="" fill sizes="12px" src="/orbit/node-large.svg" />
      </span>
      <span className="absolute bottom-[19%] right-[16%] size-[7px]">
        <Image alt="" fill sizes="7px" src="/orbit/node-depth.svg" />
      </span>
    </div>
  );
}
