"use client";

import { useActionState } from "react";

import {
  saveAttributeDefinition,
  type AttributeActionState,
} from "@/app/cms/(workspace)/categories/[id]/attributes/actions";
import { Button } from "@/components/ui/button";
import type { CmsAttributeDefinition } from "@/features/cms/data/attributes";

const initialState: AttributeActionState = {};
const inputClass =
  "mt-2 min-h-11 w-full rounded-xl border border-smoke/30 bg-white px-3 text-sm disabled:bg-smoke/5";

export function AttributeDefinitionManager({
  canEdit,
  categoryId,
  definitions,
}: {
  canEdit: boolean;
  categoryId: number;
  definitions: CmsAttributeDefinition[];
}) {
  return (
    <div className="mt-7 grid gap-6 xl:grid-cols-[minmax(20rem,0.7fr)_1.3fr]">
      {canEdit ? (
        <section className="self-start rounded-card border border-smoke/15 bg-white p-6 shadow-card xl:sticky xl:top-6">
          <h2 className="font-display text-3xl">Add definition</h2>
          <DefinitionForm categoryId={categoryId} definition={null} />
        </section>
      ) : null}
      <section className={!canEdit ? "xl:col-span-2" : undefined}>
        {definitions.length ? (
          <div className="space-y-4">
            {definitions.map((definition) => (
              <details
                className="rounded-card border border-smoke/15 bg-white shadow-card"
                key={definition.id}
              >
                <summary className="flex min-h-20 cursor-pointer list-none items-center justify-between px-5 marker:hidden">
                  <span>
                    <strong className="block">{definition.name}</strong>
                    <span className="mt-1 block font-mono text-xs text-smoke">
                      {definition.key} · {definition.valueType}
                    </span>
                  </span>
                  <span className="text-xs font-semibold text-smoke">
                    {definition.archived
                      ? "Archived"
                      : definition.isRequired
                        ? "Required"
                        : "Optional"}
                  </span>
                </summary>
                <div className="border-t border-smoke/15 p-5">
                  <DefinitionForm
                    canEdit={canEdit}
                    categoryId={categoryId}
                    definition={definition}
                  />
                </div>
              </details>
            ))}
          </div>
        ) : (
          <p className="rounded-card border border-smoke/15 bg-white p-10 text-center text-sm text-smoke shadow-card">
            No structured attributes for this category yet.
          </p>
        )}
      </section>
    </div>
  );
}

function DefinitionForm({
  canEdit = true,
  categoryId,
  definition,
}: {
  canEdit?: boolean;
  categoryId: number;
  definition: CmsAttributeDefinition | null;
}) {
  const action = saveAttributeDefinition.bind(
    null,
    categoryId,
    definition?.id ?? null,
  );
  const [state, formAction, pending] = useActionState(action, initialState);
  const disabled = !canEdit || pending;
  return (
    <form
      action={formAction}
      className="mt-5 grid gap-4 sm:grid-cols-2"
      noValidate
    >
      <input
        name="updatedAt"
        type="hidden"
        value={definition?.updatedAt ?? ""}
      />
      <label className="text-sm font-semibold">
        Name
        <input
          className={inputClass}
          defaultValue={definition?.name}
          disabled={disabled}
          name="name"
          required
        />
      </label>
      <label className="text-sm font-semibold">
        Machine key
        <input
          className={inputClass}
          defaultValue={definition?.key}
          disabled={disabled}
          name="key"
          pattern="[a-z][a-z0-9_]*"
          required
        />
      </label>
      <label className="text-sm font-semibold">
        Value type
        <select
          className={inputClass}
          defaultValue={definition?.valueType ?? "text"}
          disabled={disabled}
          name="valueType"
        >
          <option value="text">Text</option>
          <option value="number">Number</option>
          <option value="boolean">Yes / no</option>
          <option value="option">Single option</option>
          <option value="multi_option">Multiple options</option>
        </select>
      </label>
      <label className="text-sm font-semibold">
        Sort order
        <input
          className={inputClass}
          defaultValue={definition?.sortOrder ?? 0}
          disabled={disabled}
          min="0"
          name="sortOrder"
          type="number"
        />
      </label>
      <label className="text-sm font-semibold sm:col-span-2">
        Options (comma separated)
        <input
          className={inputClass}
          defaultValue={definition?.options.join(", ")}
          disabled={disabled}
          name="options"
        />
      </label>
      <label className="flex items-center gap-3 text-sm font-semibold">
        <input
          defaultChecked={definition?.isRequired}
          disabled={disabled}
          name="isRequired"
          type="checkbox"
        />
        Required to publish
      </label>
      <label className="flex items-center gap-3 text-sm font-semibold">
        <input
          defaultChecked={definition?.isFilterable}
          disabled={disabled}
          name="isFilterable"
          type="checkbox"
        />
        Public filter
      </label>
      {definition ? (
        <label className="flex items-center gap-3 text-sm font-semibold">
          <input
            defaultChecked={definition.archived}
            disabled={disabled}
            name="archived"
            type="checkbox"
          />
          Archive definition
        </label>
      ) : null}
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
            {pending
              ? "Saving…"
              : definition
                ? "Save definition"
                : "Add definition"}
          </Button>
        </div>
      ) : null}
    </form>
  );
}
