import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { PageHeading } from "@/components/cms/page-heading";
import { StatusBadge } from "@/components/cms/status-badge";
import { getMediaLibrary } from "@/features/cms/data/media-library";

export const metadata: Metadata = { title: "Media" };

export default async function MediaLibraryPage() {
  const media = await getMediaLibrary();

  return (
    <>
      <PageHeading
        description="Review optimized catalog derivatives, rights status, dimensions, and primary-image coverage. Originals remain private."
        title="Media library"
      />

      {media.length ? (
        <ul className="mt-7 grid gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
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
                    sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 25vw"
                    src={item.publicUrl}
                  />
                ) : (
                  <div className="grid h-full place-items-center p-5 text-center text-sm text-smoke">
                    Derivative unavailable
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
                <Link
                  className="mt-3 inline-flex min-h-11 items-center text-sm font-semibold underline decoration-antique-brass underline-offset-4"
                  href={`/cms/products/${item.product.id}/media`}
                >
                  {item.product.name} · {item.product.sku}
                </Link>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-7 rounded-card border border-smoke/15 bg-white p-10 text-center shadow-card">
          <h2 className="font-display text-3xl">No media yet</h2>
          <p className="mt-3 text-sm text-smoke">
            Add images from a saved product’s media workspace.
          </p>
        </div>
      )}
    </>
  );
}
