"use client";

import { useActionState } from "react";

import { signIn, type LoginState } from "@/app/cms/(auth)/login/actions";
import { Button } from "@/components/ui/button";

const initialState: LoginState = {};

export function LoginForm({ configured }: { configured: boolean }) {
  const [state, formAction, isPending] = useActionState(signIn, initialState);

  return (
    <form action={formAction} className="mt-8 space-y-5" noValidate>
      <div>
        <label className="text-sm font-semibold" htmlFor="email">
          Email address
        </label>
        <input
          aria-describedby={
            state.fieldErrors?.email ? "email-error" : undefined
          }
          aria-invalid={Boolean(state.fieldErrors?.email)}
          autoComplete="email"
          className="mt-2 min-h-12 w-full rounded-xl border border-smoke/35 bg-white px-4 text-base shadow-sm"
          disabled={!configured || isPending}
          id="email"
          name="email"
          required
          type="email"
        />
        {state.fieldErrors?.email ? (
          <p className="mt-2 text-sm text-signal-red" id="email-error">
            {state.fieldErrors.email}
          </p>
        ) : null}
      </div>

      <div>
        <label className="text-sm font-semibold" htmlFor="password">
          Password
        </label>
        <input
          aria-describedby={
            state.fieldErrors?.password ? "password-error" : undefined
          }
          aria-invalid={Boolean(state.fieldErrors?.password)}
          autoComplete="current-password"
          className="mt-2 min-h-12 w-full rounded-xl border border-smoke/35 bg-white px-4 text-base shadow-sm"
          disabled={!configured || isPending}
          id="password"
          name="password"
          required
          type="password"
        />
        {state.fieldErrors?.password ? (
          <p className="mt-2 text-sm text-signal-red" id="password-error">
            {state.fieldErrors.password}
          </p>
        ) : null}
      </div>

      {state.message ? (
        <p aria-live="polite" className="text-sm text-signal-red" role="status">
          {state.message}
        </p>
      ) : null}

      <Button
        className="w-full"
        disabled={!configured || isPending}
        type="submit"
      >
        {isPending ? "Checking account…" : "Sign in securely"}
      </Button>
    </form>
  );
}
