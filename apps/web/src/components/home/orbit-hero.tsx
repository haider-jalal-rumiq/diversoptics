import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

import { OrbitArtwork } from "./orbit-artwork";

export function OrbitHero() {
  return (
    <section className="bg-obsidian py-10 text-porcelain sm:py-12">
      <Container>
        <div className="grid min-h-[440px] items-center gap-8 overflow-hidden rounded-xl bg-obsidian py-8 lg:grid-cols-[1.08fr_0.92fr] lg:px-10 lg:py-0">
          <div className="z-10">
            <p className="text-xs font-semibold tracking-[0.08em] text-porcelain/80">
              DIVERSO OPTICS · F-11 MARKAZ
            </p>
            <h1 className="mt-4 max-w-md font-display text-[3.25rem] leading-[0.98] tracking-[-0.02em] sm:text-6xl">
              Find the pair that feels like yours.
            </h1>
            <p className="mt-5 max-w-md text-[15px] leading-6 text-porcelain/80">
              Explore curated eyewear, watches and writing instruments, then ask
              the team on WhatsApp.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-2">
              <Button asChild>
                <Link href="/#featured">Explore catalog</Link>
              </Button>
              <Button
                asChild
                className="text-orbit-gold hover:bg-white/10"
                tone="quiet"
              >
                <Link href="/#store">Visit the store</Link>
              </Button>
            </div>
          </div>
          <OrbitArtwork />
        </div>
      </Container>
    </section>
  );
}
