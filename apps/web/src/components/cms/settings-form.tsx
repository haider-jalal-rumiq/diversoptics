"use client";

import { useActionState } from "react";

import {
  saveSettings,
  type SettingsActionState,
} from "@/app/cms/(workspace)/settings/actions";
import { Button } from "@/components/ui/button";

const initialState: SettingsActionState = {};
const inputClass =
  "mt-2 min-h-12 w-full rounded-xl border border-smoke/30 bg-white px-4 text-sm disabled:bg-smoke/5";

export function SettingsForm({
  canEdit,
  settings,
}: {
  canEdit: boolean;
  settings: {
    delivery_available: boolean;
    full_address: string | null;
    location_label: string;
    phone_number: string | null;
    public_email: string | null;
    updated_at: string;
    whatsapp_number: string;
  };
}) {
  const [state, formAction, pending] = useActionState(
    saveSettings,
    initialState,
  );
  const disabled = !canEdit || pending;

  return (
    <form
      action={formAction}
      className="mt-5 grid gap-4 sm:grid-cols-2"
      noValidate
    >
      <input name="updatedAt" type="hidden" value={settings.updated_at} />
      <label className="text-sm font-semibold">
        Public location label
        <input
          className={inputClass}
          defaultValue={settings.location_label}
          disabled={disabled}
          name="locationLabel"
          required
        />
      </label>
      <label className="text-sm font-semibold">
        WhatsApp number
        <input
          className={inputClass}
          defaultValue={settings.whatsapp_number}
          disabled={disabled}
          name="whatsappNumber"
          required
        />
      </label>
      <label className="text-sm font-semibold sm:col-span-2">
        Full address (keep blank until verified)
        <input
          className={inputClass}
          defaultValue={settings.full_address ?? ""}
          disabled={disabled}
          name="fullAddress"
        />
      </label>
      <label className="text-sm font-semibold">
        Public phone (optional)
        <input
          className={inputClass}
          defaultValue={settings.phone_number ?? ""}
          disabled={disabled}
          name="phoneNumber"
        />
      </label>
      <label className="text-sm font-semibold">
        Public email (optional)
        <input
          className={inputClass}
          defaultValue={settings.public_email ?? ""}
          disabled={disabled}
          name="publicEmail"
          type="email"
        />
      </label>
      <label className="flex min-h-12 items-center gap-3 text-sm font-semibold sm:col-span-2">
        <input
          defaultChecked={settings.delivery_available}
          disabled={disabled}
          name="deliveryAvailable"
          type="checkbox"
        />
        Delivery is available (coverage, fee, timing, and COD remain unstated)
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
            {pending ? "Saving…" : "Save settings"}
          </Button>
        </div>
      ) : null}
    </form>
  );
}
