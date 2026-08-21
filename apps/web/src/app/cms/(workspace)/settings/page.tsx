import type { Metadata } from "next";

import { updateStaffProfile } from "@/app/cms/(workspace)/settings/actions";
import { PageHeading } from "@/components/cms/page-heading";
import { InviteStaffForm } from "@/components/cms/invite-staff-form";
import { SettingsForm } from "@/components/cms/settings-form";
import { StatusBadge } from "@/components/cms/status-badge";
import { Button } from "@/components/ui/button";
import { getCurrentStaff } from "@/features/cms/auth/staff";
import { getCmsSettings } from "@/features/cms/data/settings";
import { hasSupabaseSecretKey } from "@/lib/supabase/admin";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const [{ settings, profiles }, staff] = await Promise.all([
    getCmsSettings(),
    getCurrentStaff(),
  ]);
  const isOwner = staff?.role === "owner";

  return (
    <>
      <PageHeading
        description="Critical contact facts and staff permissions are owner-controlled and protected by optimistic concurrency."
        title="Settings"
      />

      <section className="mt-7 rounded-card border border-smoke/15 bg-white p-6 shadow-card">
        <h2 className="font-display text-3xl">Public business details</h2>
        <p className="mt-2 text-sm leading-6 text-smoke">
          Unverified address, hours, email, and policy details should remain
          blank until the client supplies them.
        </p>
        <SettingsForm canEdit={isOwner} settings={settings} />
      </section>

      <section className="mt-7 rounded-card border border-smoke/15 bg-white p-6 shadow-card">
        <h2 className="font-display text-3xl">Staff access</h2>
        <p className="mt-2 text-sm leading-6 text-smoke">
          New Auth identities remain disabled by default until the owner-driven
          invitation workflow activates their profile.
        </p>
        {isOwner ? (
          <InviteStaffForm configured={hasSupabaseSecretKey()} />
        ) : null}
        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[44rem] text-left text-sm">
            <thead className="border-b border-smoke/20 text-xs tracking-[0.12em] text-smoke uppercase">
              <tr>
                <th className="px-3 py-3">Staff profile</th>
                <th className="px-3 py-3">State</th>
                <th className="px-3 py-3">Permissions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-smoke/15">
              {profiles.map((profile) => (
                <tr key={profile.id}>
                  <td className="px-3 py-4">
                    <strong className="block">
                      {profile.display_name ?? "Invitation pending name"}
                    </strong>
                    <span className="mt-1 block font-mono text-xs text-smoke">
                      {profile.id}
                    </span>
                  </td>
                  <td className="px-3 py-4">
                    <StatusBadge value={profile.status} />
                  </td>
                  <td className="px-3 py-4">
                    {isOwner && profile.id !== staff.id ? (
                      <form
                        action={updateStaffProfile}
                        className="flex items-center gap-2"
                      >
                        <input
                          name="profileId"
                          type="hidden"
                          value={profile.id}
                        />
                        <select
                          className="min-h-11 rounded-xl border border-smoke/30 bg-white px-3"
                          defaultValue={profile.role}
                          name="role"
                        >
                          <option value="viewer">Viewer</option>
                          <option value="editor">Editor</option>
                          <option value="owner">Owner</option>
                        </select>
                        <select
                          className="min-h-11 rounded-xl border border-smoke/30 bg-white px-3"
                          defaultValue={profile.status}
                          name="status"
                        >
                          <option value="active">Active</option>
                          <option value="disabled">Disabled</option>
                        </select>
                        <Button className="px-4" tone="quiet" type="submit">
                          Update
                        </Button>
                      </form>
                    ) : (
                      <span className="capitalize text-smoke">
                        {profile.role}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
