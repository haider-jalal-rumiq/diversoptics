import type { Metadata } from "next";

import { Breadcrumbs } from "@/components/catalog/breadcrumbs";
import { ShortlistView } from "@/components/catalog/shortlist-view";
import { SiteShell } from "@/components/site/site-shell";
import { Container } from "@/components/ui/container";
import { SHORTLIST_LIMIT } from "@/features/catalog/domain/shortlist";

export const metadata: Metadata = {
  description:
    "Compare the pieces you saved and send them to Diverso Optics in one WhatsApp message.",
  // Personal to one browser, so there is nothing here worth indexing.
  robots: { follow: false, index: false },
  title: "Your shortlist",
};

export default function ShortlistPage() {
  return (
    <SiteShell>
      <main className="bg-porcelain py-8 sm:py-12" id="main">
        <Container>
          <Breadcrumbs
            trail={[
              { href: "/", label: "Home" },
              { href: "/shortlist", label: "Shortlist" },
            ]}
          />

          <h1 className="mt-5 font-display text-[2.75rem] leading-[1.05] tracking-[-0.01em] sm:text-5xl">
            Your shortlist
          </h1>
          <p className="mt-4 max-w-prose text-base leading-7 text-smoke">
            {/*
              docs/04 forbids calling this a cart or implying a reservation, so
              the copy is explicit about what it is and what it is not.
            */}
            Up to {SHORTLIST_LIMIT} pieces, saved in this browser only. Nothing
            is reserved and no payment is taken — sending the list simply starts
            a WhatsApp conversation with the F-11 team.
          </p>

          <div className="mt-9">
            <ShortlistView />
          </div>
        </Container>
      </main>
    </SiteShell>
  );
}
