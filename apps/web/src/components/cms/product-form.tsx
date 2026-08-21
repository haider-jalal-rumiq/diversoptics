"use client";

import { useActionState, useState } from "react";

import {
  saveProduct,
  type ProductActionState,
} from "@/app/cms/(workspace)/products/actions";
import { Button } from "@/components/ui/button";
import type {
  ProductEditorOption,
  ProductEditorRecord,
} from "@/features/cms/data/product-editor";
import { createSlug } from "@/features/cms/domain/product-form";

const initialState: ProductActionState = {};
const fieldClass =
  "mt-2 min-h-12 w-full rounded-xl border border-smoke/30 bg-white px-4 text-sm disabled:cursor-not-allowed disabled:bg-smoke/5";

export function ProductForm({
  brands,
  canEdit,
  categories,
  product,
}: {
  brands: ProductEditorOption[];
  canEdit: boolean;
  categories: ProductEditorOption[];
  product: ProductEditorRecord | null;
}) {
  const action = saveProduct.bind(null, product?.id ?? null);
  const [state, formAction, pending] = useActionState(action, initialState);
  const [name, setName] = useState(product?.name ?? "");
  const [slug, setSlug] = useState(product?.slug ?? "");
  const disabled = !canEdit || pending;

  return (
    <form action={formAction} className="mt-7 space-y-6" noValidate>
      <input name="updatedAt" type="hidden" value={product?.updatedAt ?? ""} />

      <section className="grid gap-5 rounded-card border border-smoke/15 bg-white p-6 shadow-card lg:grid-cols-2">
        <div className="lg:col-span-2">
          <h2 className="font-display text-3xl">Identity</h2>
          <p className="mt-2 text-sm text-smoke">
            Use the exact name, model, and SKU from verified inventory.
          </p>
        </div>
        <Field error={state.fieldErrors?.name} label="Product name" name="name">
          <input
            className={fieldClass}
            disabled={disabled}
            id="name"
            name="name"
            onBlur={() => {
              if (!slug) setSlug(createSlug(name));
            }}
            onChange={(event) => setName(event.target.value)}
            required
            value={name}
          />
        </Field>
        <Field error={state.fieldErrors?.slug} label="URL slug" name="slug">
          <input
            className={fieldClass}
            disabled={disabled}
            id="slug"
            name="slug"
            onChange={(event) => setSlug(createSlug(event.target.value))}
            required
            value={slug}
          />
        </Field>
        <Field
          error={state.fieldErrors?.modelNumber}
          label="Model number"
          name="modelNumber"
        >
          <input
            className={fieldClass}
            defaultValue={product?.modelNumber}
            disabled={disabled}
            id="modelNumber"
            name="modelNumber"
            required
          />
        </Field>
        <Field error={state.fieldErrors?.sku} label="SKU" name="sku">
          <input
            className={fieldClass}
            defaultValue={product?.sku}
            disabled={disabled}
            id="sku"
            name="sku"
            required
          />
        </Field>
        <Field
          error={state.fieldErrors?.categoryId}
          label="Category"
          name="categoryId"
        >
          <select
            className={fieldClass}
            defaultValue={product?.categoryId ?? ""}
            disabled={disabled}
            id="categoryId"
            name="categoryId"
            required
          >
            <option disabled value="">
              Select category
            </option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name} ({category.status})
              </option>
            ))}
          </select>
        </Field>
        <Field error={state.fieldErrors?.brandId} label="Brand" name="brandId">
          <select
            className={fieldClass}
            defaultValue={product?.brandId ?? ""}
            disabled={disabled}
            id="brandId"
            name="brandId"
          >
            <option value="">Unbranded / not applicable</option>
            {brands.map((brand) => (
              <option key={brand.id} value={brand.id}>
                {brand.name} ({brand.status})
              </option>
            ))}
          </select>
        </Field>
      </section>

      <section className="grid gap-5 rounded-card border border-smoke/15 bg-white p-6 shadow-card lg:grid-cols-2">
        <div className="lg:col-span-2">
          <h2 className="font-display text-3xl">Customer-facing content</h2>
          <p className="mt-2 text-sm text-smoke">
            Lead with useful, verifiable information. Avoid unsupported product
            or authenticity claims.
          </p>
        </div>
        <Field
          error={state.fieldErrors?.eyebrow}
          label="Eyebrow"
          name="eyebrow"
        >
          <input
            className={fieldClass}
            defaultValue={product?.eyebrow ?? ""}
            disabled={disabled}
            id="eyebrow"
            name="eyebrow"
          />
        </Field>
        <Field
          error={state.fieldErrors?.shortDescription}
          label="Short description"
          name="shortDescription"
        >
          <input
            className={fieldClass}
            defaultValue={product?.shortDescription ?? ""}
            disabled={disabled}
            id="shortDescription"
            maxLength={320}
            name="shortDescription"
          />
        </Field>
        <Field
          className="lg:col-span-2"
          error={state.fieldErrors?.description}
          label="Full description"
          name="description"
        >
          <textarea
            className={`${fieldClass} min-h-40 py-4 leading-6`}
            defaultValue={product?.description ?? ""}
            disabled={disabled}
            id="description"
            name="description"
          />
        </Field>
      </section>

      <section className="grid gap-5 rounded-card border border-smoke/15 bg-white p-6 shadow-card lg:grid-cols-3">
        <div className="lg:col-span-3">
          <h2 className="font-display text-3xl">Commercial state</h2>
          <p className="mt-2 text-sm text-smoke">
            “Price on inquiry” is the safe default until the client confirms a
            price.
          </p>
        </div>
        <Field
          error={state.fieldErrors?.priceMode}
          label="Price mode"
          name="priceMode"
        >
          <select
            className={fieldClass}
            defaultValue={product?.priceMode ?? "on_inquiry"}
            disabled={disabled}
            id="priceMode"
            name="priceMode"
          >
            <option value="on_inquiry">Price on inquiry</option>
            <option value="fixed">Fixed price</option>
            <option value="from">Price from</option>
            <option value="hidden">Hide price</option>
          </select>
        </Field>
        <Field error={state.fieldErrors?.price} label="Price" name="price">
          <input
            className={fieldClass}
            defaultValue={product?.price ?? ""}
            disabled={disabled}
            id="price"
            inputMode="decimal"
            min="0.01"
            name="price"
            step="0.01"
            type="number"
          />
        </Field>
        <Field
          error={state.fieldErrors?.currency}
          label="Currency"
          name="currency"
        >
          <input
            className={fieldClass}
            defaultValue={product?.currency ?? "PKR"}
            disabled={disabled}
            id="currency"
            maxLength={3}
            name="currency"
          />
        </Field>
        <Field
          error={state.fieldErrors?.availability}
          label="Availability"
          name="availability"
        >
          <select
            className={fieldClass}
            defaultValue={product?.availability ?? "ask"}
            disabled={disabled}
            id="availability"
            name="availability"
          >
            <option value="ask">Ask</option>
            <option value="in_store">In store</option>
            <option value="available_to_order">Available to order</option>
            <option value="out_of_stock">Out of stock</option>
          </select>
        </Field>
        <Field
          error={state.fieldErrors?.status}
          label="Publication status"
          name="status"
        >
          <select
            className={fieldClass}
            defaultValue={product?.status ?? "draft"}
            disabled={disabled}
            id="status"
            name="status"
          >
            <option value="draft">Draft</option>
            {product ? <option value="published">Published</option> : null}
            {product ? <option value="archived">Archived</option> : null}
          </select>
          {product && !product.primaryMediaReady ? (
            <p className="mt-2 text-xs leading-5 text-brass-ink">
              Publishing remains blocked until one approved primary derivative
              is ready.
            </p>
          ) : null}
        </Field>
        <label className="flex min-h-12 items-center gap-3 self-end rounded-xl border border-smoke/20 px-4 text-sm font-semibold">
          <input
            defaultChecked={product?.featured}
            disabled={disabled}
            name="featured"
            type="checkbox"
          />
          Feature this product
        </label>
      </section>

      {state.message ? (
        <p
          aria-live="polite"
          className={
            state.message === "Saved successfully."
              ? "text-sm text-signal-green"
              : "text-sm text-signal-red"
          }
          role="status"
        >
          {state.message}
        </p>
      ) : null}

      {canEdit ? (
        <div className="sticky bottom-4 flex justify-end rounded-2xl border border-smoke/15 bg-white/95 p-3 shadow-card backdrop-blur">
          <Button disabled={pending} type="submit">
            {pending ? "Saving…" : product ? "Save changes" : "Create draft"}
          </Button>
        </div>
      ) : null}
    </form>
  );
}

function Field({
  children,
  className,
  error,
  label,
  name,
}: {
  children: React.ReactNode;
  className?: string;
  error?: string;
  label: string;
  name: string;
}) {
  return (
    <div className={className}>
      <label className="text-sm font-semibold" htmlFor={name}>
        {label}
      </label>
      {children}
      {error ? (
        <p className="mt-2 text-sm text-signal-red" id={`${name}-error`}>
          {error}
        </p>
      ) : null}
    </div>
  );
}
