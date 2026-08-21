"use client";

import { useActionState } from "react";

import {
  saveProductAttributes,
  type ProductAttributesState,
} from "@/app/cms/(workspace)/products/[id]/attributes/actions";
import { Button } from "@/components/ui/button";
import type { CmsAttributeDefinition } from "@/features/cms/data/attributes";
import type { Json } from "@/types/database.types";

const initialState: ProductAttributesState = {};
const inputClass =
  "mt-2 min-h-11 w-full rounded-xl border border-smoke/30 bg-white px-3 text-sm disabled:bg-smoke/5";

type CurrentValue = {
  attribute_definition_id: number;
  value_boolean: boolean | null;
  value_json: Json | null;
  value_number: number | null;
  value_text: string | null;
};

export function ProductAttributesForm({
  canEdit,
  definitions,
  productId,
  values,
}: {
  canEdit: boolean;
  definitions: CmsAttributeDefinition[];
  productId: number;
  values: CurrentValue[];
}) {
  const action = saveProductAttributes.bind(null, productId);
  const [state, formAction, pending] = useActionState(action, initialState);
  const disabled = !canEdit || pending;
  const currentByDefinition = new Map(
    values.map((value) => [value.attribute_definition_id, value]),
  );

  return (
    <section className="mt-7 rounded-card border border-smoke/15 bg-white p-6 shadow-card">
      <h2 className="font-display text-3xl">Structured attributes</h2>
      <p className="mt-2 text-sm leading-6 text-smoke">
        Required values must be complete before publication. Filterable fields
        will power the public catalog later.
      </p>
      {definitions.length ? (
        <form
          action={formAction}
          className="mt-5 grid gap-4 sm:grid-cols-2"
          noValidate
        >
          {definitions.map((definition) => {
            const current = currentByDefinition.get(definition.id);
            const defaultValue = serializeValue(current);
            return (
              <label className="text-sm font-semibold" key={definition.id}>
                {definition.name}
                {definition.isRequired ? " *" : ""}
                {definition.valueType === "boolean" ? (
                  <select
                    className={inputClass}
                    defaultValue={defaultValue}
                    disabled={disabled}
                    name={`attribute_${definition.id}`}
                    required={definition.isRequired}
                  >
                    <option value="">Not set</option>
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                ) : definition.valueType === "option" ? (
                  <select
                    className={inputClass}
                    defaultValue={defaultValue}
                    disabled={disabled}
                    name={`attribute_${definition.id}`}
                    required={definition.isRequired}
                  >
                    <option value="">Not set</option>
                    {definition.options.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    className={inputClass}
                    defaultValue={defaultValue}
                    disabled={disabled}
                    name={`attribute_${definition.id}`}
                    placeholder={
                      definition.valueType === "multi_option"
                        ? definition.options.join(", ")
                        : undefined
                    }
                    required={definition.isRequired}
                    type={definition.valueType === "number" ? "number" : "text"}
                  />
                )}
                <span className="mt-1 block text-xs font-normal text-smoke">
                  {definition.valueType.replaceAll("_", " ")}
                  {definition.isFilterable ? " · public filter" : ""}
                </span>
              </label>
            );
          })}
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
                {pending ? "Saving…" : "Save attributes"}
              </Button>
            </div>
          ) : null}
        </form>
      ) : (
        <p className="mt-5 rounded-xl bg-porcelain p-4 text-sm text-smoke">
          No structured attributes are defined for this category.
        </p>
      )}
    </section>
  );
}

function serializeValue(value: CurrentValue | undefined) {
  if (!value) return "";
  if (value.value_text !== null) return value.value_text;
  if (value.value_number !== null) return String(value.value_number);
  if (value.value_boolean !== null) return String(value.value_boolean);
  if (Array.isArray(value.value_json))
    return value.value_json
      .filter((item): item is string => typeof item === "string")
      .join(", ");
  return "";
}
