import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { CmsHeader } from "@/components/cms/cms-header";
import { CmsNav } from "@/components/cms/cms-nav";
import { getCurrentStaff } from "@/features/cms/auth/staff";
import { getSupabasePublicConfig } from "@/lib/supabase/config";

export const metadata: Metadata = {
  title: { default: "CMS", template: "%s | Diverso CMS" },
  robots: { follow: false, index: false },
};

export const dynamic = "force-dynamic";

export default async function CmsWorkspaceLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  if (!getSupabasePublicConfig()) {
    redirect("/cms/login");
  }

  const staff = await getCurrentStaff();

  if (!staff) {
    redirect("/cms/login");
  }

  return (
    <div className="min-h-screen bg-porcelain lg:grid lg:grid-cols-[15.5rem_1fr]">
      <CmsNav staff={staff} />
      <div className="min-w-0">
        <CmsHeader staff={staff} />
        <main className="mx-auto w-full max-w-[92rem] p-5 sm:p-8 lg:p-10">
          {children}
        </main>
      </div>
    </div>
  );
}
