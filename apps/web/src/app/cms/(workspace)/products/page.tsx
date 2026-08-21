import type { Metadata } from "next";
import Link from "next/link";

import { PageHeading } from "@/components/cms/page-heading";
import { StatusBadge } from "@/components/cms/status-badge";
import { Button } from "@/components/ui/button";
import { canEditCatalog, getCurrentStaff } from "@/features/cms/auth/staff";
import { getCmsProducts } from "@/features/cms/data/products";

export const metadata: Metadata = { title: "Products" };

export default async function CmsProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const rawFilters = await searchParams;
  const [{ filters, products }, staff] = await Promise.all([
    getCmsProducts(rawFilters),
    getCurrentStaff(),
  ]);

  return (
    <>
      <PageHeading
        action={
          staff && canEditCatalog(staff.role) ? (
            <div className="flex flex-wrap gap-2">
              <Button asChild tone="quiet">
                <Link href="/cms/products/import">Import CSV</Link>
              </Button>
              <Button asChild>
                <Link href="/cms/products/new">Add product</Link>
              </Button>
            </div>
          ) : undefined
        }
        description="Search, review, and publish products. A complete item needs approved primary media before publication."
        title="Products"
      />

      <form
        className="mt-7 grid gap-3 rounded-card border border-smoke/15 bg-white p-4 shadow-card sm:grid-cols-[1fr_12rem_auto]"
        method="get"
      >
        <label className="sr-only" htmlFor="product-search">
          Search products
        </label>
        <input
          className="min-h-11 rounded-xl border border-smoke/30 px-4 text-sm"
          defaultValue={filters.q}
          id="product-search"
          name="q"
          placeholder="Name, SKU, or model"
          type="search"
        />
        <label className="sr-only" htmlFor="product-status">
          Filter by status
        </label>
        <select
          className="min-h-11 rounded-xl border border-smoke/30 bg-white px-4 text-sm"
          defaultValue={filters.status}
          id="product-status"
          name="status"
        >
          <option value="all">All statuses</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="archived">Archived</option>
        </select>
        <Button className="rounded-xl" type="submit">
          Apply
        </Button>
      </form>

      <div className="mt-5 overflow-hidden rounded-card border border-smoke/15 bg-white shadow-card">
        {products.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[58rem] border-collapse text-left text-sm">
              <thead className="bg-charcoal text-xs tracking-[0.12em] text-white uppercase">
                <tr>
                  <th className="px-5 py-4 font-semibold">Product</th>
                  <th className="px-5 py-4 font-semibold">Category</th>
                  <th className="px-5 py-4 font-semibold">Model / SKU</th>
                  <th className="px-5 py-4 font-semibold">Availability</th>
                  <th className="px-5 py-4 font-semibold">Status</th>
                  <th className="px-5 py-4 text-right font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-smoke/15">
                {products.map((product) => (
                  <tr key={product.id}>
                    <td className="px-5 py-4">
                      <strong className="block">{product.name}</strong>
                      <span className="mt-1 block text-xs text-smoke">
                        {product.brandName ?? "No brand"} ·{" "}
                        {product.priceMode.replaceAll("_", " ")}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-smoke">
                      {product.categoryName}
                    </td>
                    <td className="px-5 py-4">
                      <span className="block">{product.modelNumber}</span>
                      <span className="mt-1 block text-xs text-smoke">
                        {product.sku}
                      </span>
                    </td>
                    <td className="px-5 py-4 capitalize text-smoke">
                      {product.availability.replaceAll("_", " ")}
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge value={product.status} />
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Link
                        className="inline-flex min-h-11 items-center font-semibold underline decoration-antique-brass underline-offset-4"
                        href={`/cms/products/${product.id}`}
                      >
                        {staff && canEditCatalog(staff.role) ? "Edit" : "View"}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-6 py-14 text-center">
            <h2 className="font-display text-3xl">No matching products</h2>
            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-smoke">
              Start with a real inventory item or adjust the current search.
              Demo products never enter the live database.
            </p>
          </div>
        )}
      </div>
    </>
  );
}
