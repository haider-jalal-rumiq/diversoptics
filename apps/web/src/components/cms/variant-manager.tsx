"use client";

import { useActionState } from "react";

import {
  saveVariant,
  type VariantActionState,
} from "@/app/cms/(workspace)/products/[id]/variants/actions";
import { StatusBadge } from "@/components/cms/status-badge";
import { Button } from "@/components/ui/button";
import type { CmsVariant } from "@/features/cms/data/variants";

const initialState: VariantActionState = {};
const inputClass =
  "mt-2 min-h-11 w-full rounded-xl border border-smoke/30 bg-white px-3 text-sm disabled:bg-smoke/5";

export function VariantManager({
  canEdit,
  productId,
  variants,
}: {
  canEdit: boolean;
  productId: number;
  variants: CmsVariant[];
}) {
  return (
    <section className="mt-7 rounded-card border border-smoke/15 bg-white p-6 shadow-card">
      <h2 className="font-display text-3xl">Variants</h2>
      <p className="mt-2 text-sm leading-6 text-smoke">
        Add colorways, sizes, or lens options only when they have distinct
        inventory identifiers.
      </p>

      {canEdit ? <VariantForm productId={productId} variant={null} /> : null}

      {variants.length ? (
        <div className="mt-6 space-y-3">
          {variants.map((variant) => (
            <details
              className="rounded-xl border border-smoke/15"
              key={variant.id}
            >
              <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-4 px-4 marker:hidden">
                <span>
                  <strong>{variant.name}</strong>
                  <span className="ml-2 text-xs text-smoke">{variant.sku}</span>
                </span>
                <StatusBadge value={variant.status} />
              </summary>
              <div className="border-t border-smoke/15 p-4">
                <VariantForm
                  canEdit={canEdit}
                  productId={productId}
                  variant={variant}
                />
              </div>
            </details>
          ))}
        </div>
      ) : (
        <p className="mt-5 rounded-xl bg-porcelain p-4 text-sm text-smoke">
          No variants. The base product remains the only inquiry option.
        </p>
      )}
    </section>
  );
}

function VariantForm({
  canEdit = true,
  productId,
  variant,
}: {
  canEdit?: boolean;
  productId: number;
  variant: CmsVariant | null;
}) {
  const action = saveVariant.bind(null, productId, variant?.id ?? null);
  const [state, formAction, pending] = useActionState(action, initialState);
  const disabled = !canEdit || pending;

  return (
    <form
      action={formAction}
      className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      noValidate
    >
      <input name="updatedAt" type="hidden" value={variant?.updatedAt ?? ""} />
      <label className="text-sm font-semibold">
        Variant name
        <input
          className={inputClass}
          defaultValue={variant?.name}
          disabled={disabled}
          name="name"
          required
        />
      </label>
      <label className="text-sm font-semibold">
        Variant SKU
        <input
          className={inputClass}
          defaultValue={variant?.sku}
          disabled={disabled}
          name="sku"
          required
        />
      </label>
      <label className="text-sm font-semibold">
        Price mode
        <select
          className={inputClass}
          defaultValue={variant?.priceMode ?? ""}
          disabled={disabled}
          name="priceMode"
        >
          <option value="">Inherit product</option>
          <option value="on_inquiry">On inquiry</option>
          <option value="fixed">Fixed</option>
          <option value="from">From</option>
          <option value="hidden">Hidden</option>
        </select>
      </label>
      <label className="text-sm font-semibold">
        Price
        <input
          className={inputClass}
          defaultValue={variant?.price ?? ""}
          disabled={disabled}
          min="0.01"
          name="price"
          step="0.01"
          type="number"
        />
      </label>
      <label className="text-sm font-semibold">
        Availability
        <select
          className={inputClass}
          defaultValue={variant?.availability ?? "ask"}
          disabled={disabled}
          name="availability"
        >
          <option value="ask">Ask</option>
          <option value="in_store">In store</option>
          <option value="available_to_order">Available to order</option>
          <option value="out_of_stock">Out of stock</option>
        </select>
      </label>
      <label className="text-sm font-semibold">
        Status
        <select
          className={inputClass}
          defaultValue={variant?.status ?? "draft"}
          disabled={disabled}
          name="status"
        >
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          {variant ? <option value="archived">Archived</option> : null}
        </select>
      </label>
      <label className="text-sm font-semibold">
        Sort order
        <input
          className={inputClass}
          defaultValue={variant?.sortOrder ?? 0}
          disabled={disabled}
          min="0"
          name="sortOrder"
          type="number"
        />
      </label>
      {state.message ? (
        <p
          aria-live="polite"
          className={
            state.success
              ? "self-end text-sm text-signal-green"
              : "self-end text-sm text-signal-red"
          }
          role="status"
        >
          {state.message}
        </p>
      ) : null}
      {canEdit ? (
        <div className="flex items-end justify-end sm:col-span-2 lg:col-span-4">
          <Button disabled={pending} type="submit">
            {pending ? "Saving…" : variant ? "Save variant" : "Add variant"}
          </Button>
        </div>
      ) : null}
    </form>
  );
}
