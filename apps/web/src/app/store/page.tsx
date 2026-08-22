import type { Metadata } from "next";

import { Breadcrumbs } from "@/components/catalog/breadcrumbs";
import { JsonLd } from "@/components/seo/json-ld";
import { SiteShell } from "@/components/site/site-shell";
import { AssetIcon } from "@/components/ui/asset-icon";
import { Container } from "@/components/ui/container";
import { getStoreSettings } from "@/features/catalog/data/store-settings";
import { buildLocalBusinessSchema } from "@/features/catalog/domain/structured-data";
import {
  buildWhatsAppHref,
  resolveWhatsAppDestination,
} from "@/features/catalog/domain/whatsapp";
import { getSiteUrl, siteConfig } from "@/lib/config/site";

/**
 * This page is prerendered, and its content comes from the CMS. Without a
 * revalidation window it would be baked at deploy time and never reflect a
 * product the owner publishes later, until someone redeployed. Sixty seconds
 * keeps CMS edits visible quickly at negligible cost for this traffic level.
 */
export const revalidate = 60;

export const metadata: Metadata = {
  alternates: { canonical: "/store" },
  description:
    "Visit Diverso Optics in F-11 Markaz, Islamabad, or ask about a product on WhatsApp.",
  title: "F-11 store",
};

function PendingFact({ label }: { label: string }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-smoke/25 pb-2">
      <dt className="text-sm text-smoke">{label}</dt>
      <dd className="text-sm font-medium text-smoke">Not confirmed yet</dd>
    </div>
  );
}

function ConfirmedFact({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-smoke/25 pb-2">
      <dt className="text-sm text-smoke">{label}</dt>
      <dd className="text-sm font-medium">{value}</dd>
    </div>
  );
}

export default async function StorePage() {
  const settings = await getStoreSettings();

  // Showing the CMS number while dialling the test one would be worse than
  // either, so the displayed number is whichever the link actually uses.
  const destination = resolveWhatsAppDestination(settings?.whatsappNumber);
  const whatsappNumber = destination.display;

  const whatsappHref = buildWhatsAppHref(
    destination.internationalDigits,
    "Hello Diverso Optics — I would like to ask about visiting the F-11 store.",
  );

  const hours = settings?.businessHours ?? [];

  return (
    <SiteShell>
      {settings ? (
        <JsonLd
          data={buildLocalBusinessSchema({ settings, siteUrl: getSiteUrl() })}
        />
      ) : null}

      <main className="bg-porcelain py-8 sm:py-12" id="main">
        <Container>
          <Breadcrumbs
            trail={[
              { href: "/", label: "Home" },
              { href: "/store", label: "F-11 store" },
            ]}
          />

          <h1 className="mt-5 font-display text-[2.75rem] leading-[1.05] tracking-[-0.01em] sm:text-5xl">
            Diverso Optics,{" "}
            {settings?.locationLabel ?? siteConfig.locationLabel}
          </h1>

          <p className="mt-4 max-w-prose text-base leading-7 text-smoke">
            Eyewear, watches and writing instruments, with fitting and lens
            guidance in person. The fastest way to check an item is a WhatsApp
            message.
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <a
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-signal-green px-6 text-sm font-semibold text-white"
              href={whatsappHref}
            >
              <AssetIcon name="message" size={18} />
              Ask on WhatsApp · {whatsappNumber}
            </a>
            {settings?.phoneNumber ? (
              <a
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-obsidian px-6 text-sm font-semibold"
                href={`tel:${settings.phoneNumber.replace(/\s+/g, "")}`}
              >
                Call {settings.phoneNumber}
              </a>
            ) : null}
          </div>

          {/*
            AGENTS.md forbids inventing the shop number, hours, phone number or
            review evidence. Unconfirmed facts are listed as unconfirmed rather
            than filled with plausible values, and no map pin or directions link
            is rendered without a real address to point at.
          */}
          <section aria-labelledby="store-facts" className="mt-10">
            <h2
              className="font-display text-3xl leading-tight"
              id="store-facts"
            >
              Store details
            </h2>
            <dl className="mt-4 space-y-3">
              <ConfirmedFact
                label="Area"
                value={settings?.locationLabel ?? siteConfig.locationLabel}
              />
              {settings?.fullAddress ? (
                <ConfirmedFact label="Address" value={settings.fullAddress} />
              ) : (
                <PendingFact label="Shop number and full address" />
              )}
              <ConfirmedFact label="WhatsApp" value={whatsappNumber} />
              {settings?.phoneNumber ? (
                <ConfirmedFact label="Phone" value={settings.phoneNumber} />
              ) : (
                <PendingFact label="Phone" />
              )}
              {settings?.publicEmail ? (
                <ConfirmedFact label="Email" value={settings.publicEmail} />
              ) : null}
              {settings?.deliveryAvailable ? (
                <ConfirmedFact
                  label="Delivery"
                  value="Available; coverage and timing confirmed on inquiry"
                />
              ) : null}
            </dl>
          </section>

          <section aria-labelledby="store-hours" className="mt-10">
            <h2
              className="font-display text-3xl leading-tight"
              id="store-hours"
            >
              Opening hours
            </h2>
            {hours.length > 0 ? (
              <dl className="mt-4 space-y-3">
                {hours.map((entry) => (
                  <ConfirmedFact
                    key={entry.day}
                    label={entry.day}
                    value={
                      entry.closed || !entry.opens || !entry.closes
                        ? "Closed"
                        : `${entry.opens} – ${entry.closes}`
                    }
                  />
                ))}
              </dl>
            ) : (
              <p className="mt-4 max-w-prose rounded-xl border border-smoke/30 bg-white p-5 text-sm leading-6 text-smoke">
                Opening hours are not confirmed yet, so none are shown here
                rather than publishing times that might be wrong. Message the
                team on WhatsApp to check before travelling.
              </p>
            )}
          </section>

          <section aria-labelledby="store-services" className="mt-10">
            <h2
              className="font-display text-3xl leading-tight"
              id="store-services"
            >
              What happens in store
            </h2>
            <ul className="mt-4 list-none space-y-2 p-0 text-sm leading-6 text-smoke">
              <li>Trying frames and confirming fit in person.</li>
              <li>Discussing lens options with the team.</li>
              <li>
                Checking current availability of a model you have found online.
              </li>
            </ul>
            <p className="mt-4 max-w-prose text-xs leading-5 text-smoke">
              Warranty, exchange and authenticity terms are confirmed by the
              store for each item. No prescription or medical advice is offered
              through this website.
            </p>
          </section>
        </Container>
      </main>
    </SiteShell>
  );
}
