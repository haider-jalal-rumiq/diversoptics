"use client";

import { useActionState } from "react";

import {
  saveSettings,
  type SettingsActionState,
} from "@/app/cms/(workspace)/settings/actions";
import { Button } from "@/components/ui/button";
import { toBusinessHoursRows } from "@/features/cms/domain/business-hours";

const initialState: SettingsActionState = {};
const inputClass =
  "mt-2 min-h-12 w-full rounded-xl border border-smoke/30 bg-white px-4 text-sm disabled:bg-smoke/5";

export function SettingsForm({
  canEdit,
  settings,
}: {
  canEdit: boolean;
  settings: {
    business_hours: unknown;
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
  const hourRows = toBusinessHoursRows(settings.business_hours);

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

      <fieldset className="border-0 p-0 sm:col-span-2">
        <legend className="text-sm font-semibold">Opening hours</legend>
        <p className="mt-2 text-sm leading-6 text-smoke">
          {/*
            A blank day is treated as unconfirmed and is not published at all,
            which is different from marking the shop closed that day. The store
            page shows no hours until at least one day is filled in.
          */}
          Leave a day blank until the hours are confirmed. Tick “Closed” only
          when the shop is genuinely shut that day. Use 24-hour times, for
          example 11:00 and 21:00.
        </p>
        <div className="mt-4 space-y-2">
          {hourRows.map((row) => (
            <div
              className="grid items-center gap-3 rounded-xl border border-smoke/15 p-3 sm:grid-cols-[8rem_1fr_1fr_7rem]"
              key={row.day}
            >
              <span className="text-sm font-semibold capitalize">
                {row.day}
              </span>
              <label className="text-xs font-semibold text-smoke">
                Opens
                <input
                  className={inputClass}
                  defaultValue={row.opens}
                  disabled={disabled}
                  name={`hours-${row.day}-opens`}
                  placeholder="11:00"
                  type="time"
                />
              </label>
              <label className="text-xs font-semibold text-smoke">
                Closes
                <input
                  className={inputClass}
                  defaultValue={row.closes}
                  disabled={disabled}
                  name={`hours-${row.day}-closes`}
                  placeholder="21:00"
                  type="time"
                />
              </label>
              <label className="flex min-h-12 items-center gap-2 text-xs font-semibold">
                <input
                  defaultChecked={row.closed}
                  disabled={disabled}
                  name={`hours-${row.day}-closed`}
                  type="checkbox"
                />
                Closed
              </label>
            </div>
          ))}
        </div>
      </fieldset>
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
