import { Container } from "@/components/ui/container";
import { getStoreSettings } from "@/features/catalog/data/store-settings";
import { summariseBusinessHours } from "@/features/catalog/domain/store-hours";
import { siteConfig } from "@/lib/config/site";

/**
 * Address and hours come from the CMS singleton, the same source the store page
 * reads. They used to be a hard-coded "pending client confirmation" line, which
 * kept claiming the facts were missing long after the owner had entered them.
 *
 * Anything still unset stays absent rather than being filled with a plausible
 * value, so the footer can never assert an address or an opening time the shop
 * has not confirmed.
 */
export async function SiteFooter() {
  const settings = await getStoreSettings();
  const address = settings?.fullAddress ?? null;
  const hours = summariseBusinessHours(settings?.businessHours ?? []);
  const phone = settings?.phoneNumber ?? null;

  return (
    <footer className="bg-obsidian py-11 text-porcelain">
      <Container className="space-y-4">
        <p className="font-display text-2xl">DIVERSO OPTICS</p>
        <p className="text-sm">Catalog · Brands · Store · Guides · Policies</p>
        <address className="space-y-1 text-sm not-italic leading-6 text-porcelain/75">
          <p>
            {address ?? settings?.locationLabel ?? siteConfig.locationLabel}
          </p>
          {hours ? <p>{hours}</p> : null}
          {phone ? (
            <p>
              <a
                className="hover:text-orbit-gold hover:underline"
                href={`tel:${phone.replace(/\s+/g, "")}`}
              >
                {phone}
              </a>
            </p>
          ) : null}
        </address>
      </Container>
    </footer>
  );
}
