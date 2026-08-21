import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";

import {
  archiveMedia,
  makePrimary,
} from "@/app/cms/(workspace)/products/[id]/media/actions";
import { MediaUploadForm } from "@/components/cms/media-upload-form";
import { PageHeading } from "@/components/cms/page-heading";
import { StatusBadge } from "@/components/cms/status-badge";
import { Button } from "@/components/ui/button";
import { canEditCatalog, getCurrentStaff } from "@/features/cms/auth/staff";
import { getProductMedia } from "@/features/cms/data/product-media";

export const metadata: Metadata = { title: "Product media" };

export default async function ProductMediaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const productId = Number(id);

  if (!Number.isSafeInteger(productId) || productId <= 0) {
    notFound();
  }

  const [{ product, media }, staff] = await Promise.all([
    getProductMedia(productId),
    getCurrentStaff(),
  ]);

  if (!product) {
    notFound();
  }

  const canEdit = Boolean(staff && canEditCatalog(staff.role));

  return (
    <>
      <PageHeading
        description={`Private originals and optimized derivatives for ${product.sku}. Files are archived rather than destructively removed from the audit trail.`}
        eyebrow="Product media"
        title={product.name}
      />

      {canEdit ? (
        <section className="mt-7 rounded-card border border-smoke/15 bg-white p-6 shadow-card">
          <h2 className="font-display text-3xl">Add image</h2>
          <MediaUploadForm productId={productId} />
        </section>
      ) : null}

      <section className="mt-7">
        <h2 className="font-display text-3xl">Current media</h2>
        {media.length ? (
          <ul className="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {media.map((item) => (
              <li
                className="overflow-hidden rounded-card border border-smoke/15 bg-white shadow-card"
                key={item.id}
              >
                <div className="relative aspect-[4/3] bg-porcelain">
                  {item.publicUrl ? (
                    <Image
                      alt={item.altText}
                      className="object-contain p-3"
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                      src={item.publicUrl}
                    />
                  ) : (
                    <div className="grid h-full place-items-center p-6 text-center text-sm text-smoke">
                      Optimized derivative unavailable
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <div className="flex flex-wrap gap-2">
                    <StatusBadge value={item.rightsStatus} />
                    {item.isPrimary ? <StatusBadge value="primary" /> : null}
                  </div>
                  <p className="mt-4 text-sm leading-6">{item.altText}</p>
                  <p className="mt-2 text-xs text-smoke">
                    {item.width} × {item.height}px
                  </p>
                  {canEdit ? (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {!item.isPrimary && item.rightsStatus === "approved" ? (
                        <form
                          action={makePrimary.bind(null, productId, item.id)}
                        >
                          <Button className="px-4" tone="quiet" type="submit">
                            Make primary
                          </Button>
                        </form>
                      ) : null}
                      <form
                        action={archiveMedia.bind(null, productId, item.id)}
                      >
                        <Button
                          className="px-4 text-signal-red"
                          tone="quiet"
                          type="submit"
                        >
                          Archive
                        </Button>
                      </form>
                    </div>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-5 rounded-card border border-smoke/15 bg-white p-8 text-sm leading-6 text-smoke shadow-card">
            No product media yet. Publishing stays blocked until one
            rights-approved primary image has a public derivative.
          </p>
        )}
      </section>
    </>
  );
}
