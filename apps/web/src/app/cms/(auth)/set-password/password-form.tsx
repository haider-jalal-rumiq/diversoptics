"use client";

import { useActionState } from "react";

import {
  setPassword,
  type PasswordState,
} from "@/app/cms/(auth)/set-password/actions";
import { Button } from "@/components/ui/button";

const initialState: PasswordState = {};

export function PasswordForm() {
  const [state, formAction, pending] = useActionState(
    setPassword,
    initialState,
  );
  return (
    <form action={formAction} className="mt-6 space-y-4" noValidate>
      <label className="block text-sm font-semibold">
        New password
        <input
          autoComplete="new-password"
          className="mt-2 min-h-12 w-full rounded-xl border border-smoke/30 px-4"
          disabled={pending}
          name="password"
          required
          type="password"
        />
      </label>
      <label className="block text-sm font-semibold">
        Confirm password
        <input
          autoComplete="new-password"
          className="mt-2 min-h-12 w-full rounded-xl border border-smoke/30 px-4"
          disabled={pending}
          name="confirmPassword"
          required
          type="password"
        />
      </label>
      <p className="text-xs leading-5 text-smoke">
        At least 12 characters with uppercase, lowercase, a number, and a
        symbol.
      </p>
      {state.message ? (
        <p aria-live="polite" className="text-sm text-signal-red" role="status">
          {state.message}
        </p>
      ) : null}
      <Button className="w-full" disabled={pending} type="submit">
        {pending ? "Saving…" : "Set password"}
      </Button>
    </form>
  );
}
