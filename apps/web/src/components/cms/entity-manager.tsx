"use client";

import { useActionState, useState } from "react";
import Link from "next/link";

import {
  saveEntity,
  type EntityActionState,
} from "@/app/cms/(workspace)/entities/actions";
import { StatusBadge } from "@/components/cms/status-badge";
import { Button } from "@/components/ui/button";
import type { CmsEntity, EntityKind } from "@/features/cms/data/entities";
import { createSlug } from "@/features/cms/domain/product-form";

const initialState: EntityActionState = {};
const inputClass =
  "mt-2 min-h-11 w-full rounded-xl border border-smoke/30 bg-white px-4 text-sm disabled:bg-smoke/5";

export function EntityManager({
  canEdit,
  entities,
  kind,
}: {
  canEdit: boolean;
  entities: CmsEntity[];
  kind: EntityKind;
}) {
  return (
    <div className="mt-7 grid gap-6 xl:grid-cols-[minmax(20rem,0.72fr)_1.28fr]">
      {canEdit ? (
        <section className="self-start rounded-card border border-smoke/15 bg-white p-6 shadow-card xl:sticky xl:top-6">
          <h2 className="font-display text-3xl">Add {kind}</h2>
          <EntityForm entity={null} kind={kind} />
        </section>
      ) : null}

      <section className={!canEdit ? "xl:col-span-2" : undefined}>
        <h2 className="sr-only">Existing {kind}s</h2>
        {entities.length ? (
          <div className="space-y-4">
            {entities.map((entity) => (
              <details
                className="rounded-card border border-smoke/15 bg-white shadow-card"
                key={entity.id}
              >
                <summary className="flex min-h-20 cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 marker:hidden">
                  <span>
                    <strong className="block">{entity.name}</strong>
                    <span className="mt-1 block text-xs text-smoke">
                      /{entity.slug}
                    </span>
                  </span>
                  <StatusBadge value={entity.status} />
                </summary>
                <div className="border-t border-smoke/15 p-5">
                  {kind === "collection" ? (
                    <Link
                      className="inline-flex min-h-11 items-center text-sm font-semibold underline decoration-antique-brass underline-offset-4"
                      href={`/cms/collections/${entity.id}`}
                    >
                      Assign products
                    </Link>
                  ) : null}
                  {kind === "category" ? (
                    <Link
                      className="inline-flex min-h-11 items-center text-sm font-semibold underline decoration-antique-brass underline-offset-4"
                      href={`/cms/categories/${entity.id}/attributes`}
                    >
                      Manage attributes
                    </Link>
                  ) : null}
                  <EntityForm canEdit={canEdit} entity={entity} kind={kind} />
                </div>
              </details>
            ))}
          </div>
        ) : (
          <div className="rounded-card border border-smoke/15 bg-white p-10 text-center shadow-card">
            <h2 className="font-display text-3xl">No {kind}s yet</h2>
            <p className="mt-3 text-sm text-smoke">
              Add only entries confirmed for the live Diverso inventory.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

function EntityForm({
  canEdit = true,
  entity,
  kind,
}: {
  canEdit?: boolean;
  entity: CmsEntity | null;
  kind: EntityKind;
}) {
  const action = saveEntity.bind(null, kind, entity?.id ?? null);
  const [state, formAction, pending] = useActionState(action, initialState);
  const [name, setName] = useState(entity?.name ?? "");
  const [slug, setSlug] = useState(entity?.slug ?? "");
  const disabled = !canEdit || pending;

  return (
    <form
      action={formAction}
      className="mt-5 grid gap-4 sm:grid-cols-2"
      noValidate
    >
      <input name="updatedAt" type="hidden" value={entity?.updatedAt ?? ""} />
      <label className="text-sm font-semibold">
        Name
        <input
          className={inputClass}
          disabled={disabled}
          name="name"
          onBlur={() => {
            if (!slug) setSlug(createSlug(name));
          }}
          onChange={(event) => setName(event.target.value)}
          required
          value={name}
        />
      </label>
      <label className="text-sm font-semibold">
        URL slug
        <input
          className={inputClass}
          disabled={disabled}
          name="slug"
          onChange={(event) => setSlug(createSlug(event.target.value))}
          required
          value={slug}
        />
      </label>
      {kind !== "brand" ? (
        <label className="text-sm font-semibold sm:col-span-2">
          Eyebrow
          <input
            className={inputClass}
            defaultValue={entity?.eyebrow ?? ""}
            disabled={disabled}
            name="eyebrow"
          />
        </label>
      ) : (
        <input name="eyebrow" type="hidden" value="" />
      )}
      <label className="text-sm font-semibold sm:col-span-2">
        Description
        <textarea
          className={`${inputClass} min-h-28 py-3 leading-6`}
          defaultValue={entity?.description ?? ""}
          disabled={disabled}
          name="description"
        />
      </label>
      <label className="text-sm font-semibold">
        Status
        <select
          className={inputClass}
          defaultValue={entity?.status ?? "draft"}
          disabled={disabled}
          name="status"
        >
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          {entity ? <option value="archived">Archived</option> : null}
        </select>
      </label>
      {kind === "collection" ? (
        <input name="sortOrder" type="hidden" value="0" />
      ) : (
        <label className="text-sm font-semibold">
          Sort order
          <input
            className={inputClass}
            defaultValue={entity?.sortOrder ?? 0}
            disabled={disabled}
            min="0"
            name="sortOrder"
            type="number"
          />
        </label>
      )}
      <label className="flex min-h-11 items-center gap-3 text-sm font-semibold sm:col-span-2">
        <input
          defaultChecked={entity?.featured}
          disabled={disabled}
          name="featured"
          type="checkbox"
        />
        Featured placement
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
            {pending ? "Saving…" : entity ? "Save changes" : `Add ${kind}`}
          </Button>
        </div>
      ) : null}
    </form>
  );
}
