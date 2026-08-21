"use client";

import { useActionState } from "react";

import {
  inviteStaff,
  type SettingsActionState,
} from "@/app/cms/(workspace)/settings/actions";
import { Button } from "@/components/ui/button";

const initialState: SettingsActionState = {};
const inputClass =
  "mt-2 min-h-11 w-full rounded-xl border border-smoke/30 bg-white px-3 text-sm";

export function InviteStaffForm({ configured }: { configured: boolean }) {
  const [state, formAction, pending] = useActionState(
    inviteStaff,
    initialState,
  );
  return (
    <form
      action={formAction}
      className="mt-5 grid gap-4 sm:grid-cols-3"
      noValidate
    >
      <label className="text-sm font-semibold">
        Name
        <input
          className={inputClass}
          disabled={!configured || pending}
          name="displayName"
          required
        />
      </label>
      <label className="text-sm font-semibold">
        Email
        <input
          className={inputClass}
          disabled={!configured || pending}
          name="email"
          required
          type="email"
        />
      </label>
      <label className="text-sm font-semibold">
        Role
        <select
          className={inputClass}
          defaultValue="editor"
          disabled={!configured || pending}
          name="role"
        >
          <option value="editor">Editor</option>
          <option value="viewer">Viewer</option>
        </select>
      </label>
      {!configured ? (
        <p className="text-sm leading-6 text-brass-ink sm:col-span-3">
          Add the server-only <code>SUPABASE_SECRET_KEY</code> and configure the
          hosted invite template before sending invitations.
        </p>
      ) : null}
      {state.message ? (
        <p
          aria-live="polite"
          className={
            state.success
              ? "text-sm text-signal-green sm:col-span-2"
              : "text-sm text-signal-red sm:col-span-2"
          }
          role="status"
        >
          {state.message}
        </p>
      ) : null}
      <div className="flex justify-end sm:col-span-3">
        <Button disabled={!configured || pending} type="submit">
          {pending ? "Sending…" : "Invite staff"}
        </Button>
      </div>
    </form>
  );
}
