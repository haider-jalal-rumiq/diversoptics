"use client";

import { useActionState, useState } from "react";

import {
  savePage,
  type PageActionState,
} from "@/app/cms/(workspace)/pages/actions";
import { StatusBadge } from "@/components/cms/status-badge";
import { Button } from "@/components/ui/button";
import type { CmsPageRecord } from "@/features/cms/data/pages";
import { createSlug } from "@/features/cms/domain/product-form";

const initialState: PageActionState = {};
const inputClass =
  "mt-2 min-h-11 w-full rounded-xl border border-smoke/30 bg-white px-4 text-sm disabled:bg-smoke/5";

export function PageManager({
  canEdit,
  pages,
}: {
  canEdit: boolean;
  pages: CmsPageRecord[];
}) {
  return (
    <div className="mt-7 grid gap-6 xl:grid-cols-[minmax(21rem,0.75fr)_1.25fr]">
      {canEdit ? (
        <section className="self-start rounded-card border border-smoke/15 bg-white p-6 shadow-card xl:sticky xl:top-6">
          <h2 className="font-display text-3xl">Add editorial page</h2>
          <PageForm page={null} />
        </section>
      ) : null}
      <section className={!canEdit ? "xl:col-span-2" : undefined}>
        {pages.length ? (
          <div className="space-y-4">
            {pages.map((page) => (
              <details
                className="rounded-card border border-smoke/15 bg-white shadow-card"
                key={page.id}
              >
                <summary className="flex min-h-20 cursor-pointer list-none items-center justify-between gap-4 px-5 marker:hidden">
                  <span>
                    <strong className="block">{page.title}</strong>
                    <span className="mt-1 block text-xs text-smoke">
                      {page.kind} · /{page.slug}
                    </span>
                  </span>
                  <StatusBadge value={page.status} />
                </summary>
                <div className="border-t border-smoke/15 p-5">
                  <PageForm canEdit={canEdit} page={page} />
                </div>
              </details>
            ))}
          </div>
        ) : (
          <p className="rounded-card border border-smoke/15 bg-white p-10 text-center text-sm text-smoke shadow-card">
            No guide, policy, or general pages yet.
          </p>
        )}
      </section>
    </div>
  );
}

function PageForm({
  canEdit = true,
  page,
}: {
  canEdit?: boolean;
  page: CmsPageRecord | null;
}) {
  const action = savePage.bind(null, page?.id ?? null);
  const [state, formAction, pending] = useActionState(action, initialState);
  const [title, setTitle] = useState(page?.title ?? "");
  const [slug, setSlug] = useState(page?.slug ?? "");
  const disabled = !canEdit || pending;

  return (
    <form
      action={formAction}
      className="mt-5 grid gap-4 sm:grid-cols-2"
      noValidate
    >
      <input name="updatedAt" type="hidden" value={page?.updatedAt ?? ""} />
      <label className="text-sm font-semibold">
        Title
        <input
          className={inputClass}
          disabled={disabled}
          name="title"
          onBlur={() => {
            if (!slug) setSlug(createSlug(title));
          }}
          onChange={(event) => setTitle(event.target.value)}
          required
          value={title}
        />
      </label>
      <label className="text-sm font-semibold">
        Slug
        <input
          className={inputClass}
          disabled={disabled}
          name="slug"
          onChange={(event) => setSlug(createSlug(event.target.value))}
          required
          value={slug}
        />
      </label>
      <label className="text-sm font-semibold">
        Page type
        <select
          className={inputClass}
          defaultValue={page?.kind ?? "guide"}
          disabled={disabled}
          name="kind"
        >
          <option value="guide">Guide</option>
          <option value="policy">Policy</option>
          <option value="page">General page</option>
        </select>
      </label>
      <label className="text-sm font-semibold">
        Status
        <select
          className={inputClass}
          defaultValue={page?.status ?? "draft"}
          disabled={disabled}
          name="status"
        >
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          {page ? <option value="archived">Archived</option> : null}
        </select>
      </label>
      <label className="text-sm font-semibold sm:col-span-2">
        Excerpt
        <textarea
          className={`${inputClass} min-h-24 py-3`}
          defaultValue={page?.excerpt ?? ""}
          disabled={disabled}
          maxLength={320}
          name="excerpt"
        />
      </label>
      <label className="text-sm font-semibold sm:col-span-2">
        Body (Markdown)
        <textarea
          className={`${inputClass} min-h-56 py-3 font-mono leading-6`}
          defaultValue={page?.bodyMarkdown ?? ""}
          disabled={disabled}
          name="bodyMarkdown"
        />
      </label>
      {state.message ? (
        <p
          aria-live="polite"
          className={
            state.success
              ? "text-sm text-signal-green"
              : "text-sm text-signal-red"
          }
          role="status"
        >
          {state.message}
        </p>
      ) : null}
      {canEdit ? (
        <div className="flex justify-end sm:col-span-2">
          <Button disabled={pending} type="submit">
            {pending ? "Saving…" : page ? "Save page" : "Add page"}
          </Button>
        </div>
      ) : null}
    </form>
  );
}
