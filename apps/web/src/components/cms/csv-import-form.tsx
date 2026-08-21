"use client";

import { useActionState } from "react";

import {
  importProductDrafts,
  type ImportActionState,
} from "@/app/cms/(workspace)/products/import/actions";
import { Button } from "@/components/ui/button";

const initialState: ImportActionState = {};

export function CsvImportForm() {
  const [state, formAction, pending] = useActionState(
    importProductDrafts,
    initialState,
  );
  return (
    <form action={formAction} className="mt-6" noValidate>
      <label className="text-sm font-semibold" htmlFor="catalog-csv">
        Catalog CSV
      </label>
      <input
        accept=".csv,text/csv"
        className="mt-2 block min-h-12 w-full rounded-xl border border-smoke/30 bg-white p-3 text-sm file:mr-4 file:rounded-full file:border-0 file:bg-orbit-gold file:px-4 file:py-2 file:font-semibold"
        disabled={pending}
        id="catalog-csv"
        name="file"
        required
        type="file"
      />
      {state.message ? (
        <p
          aria-live="polite"
          className={
            state.success
              ? "mt-4 text-sm text-signal-green"
              : "mt-4 text-sm text-signal-red"
          }
          role="status"
        >
          {state.message}
        </p>
      ) : null}
      <Button className="mt-5" disabled={pending} type="submit">
        {pending ? "Validating…" : "Import drafts"}
      </Button>
    </form>
  );
}
