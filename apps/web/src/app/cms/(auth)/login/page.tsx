import type { Metadata } from "next";
import Link from "next/link";

import { LoginForm } from "@/app/cms/(auth)/login/login-form";
import { BrandMark } from "@/components/brand/brand-mark";
import { getSupabasePublicConfig } from "@/lib/supabase/config";

export const metadata: Metadata = {
  title: "CMS sign in",
  robots: { follow: false, index: false },
};

export default function CmsLoginPage() {
  const configured = Boolean(getSupabasePublicConfig());

  return (
    <main
      className="grid min-h-screen bg-charcoal lg:grid-cols-[1.05fr_0.95fr]"
      id="main"
    >
      <section className="relative hidden overflow-hidden p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div
          aria-hidden="true"
          className="absolute -right-36 top-1/2 size-[34rem] -translate-y-1/2 rounded-full border border-orbit-gold/40"
        />
        <div
          aria-hidden="true"
          className="absolute -right-4 top-1/2 size-56 -translate-y-1/2 rounded-full bg-orbit-gold shadow-[0_0_120px_rgba(254,204,41,0.22)]"
        />
        <BrandMark className="z-10 border-white/30" />
        <div className="z-10 max-w-lg">
          <p className="text-xs font-bold tracking-[0.24em] text-orbit-gold uppercase">
            Diverso workspace
          </p>
          <h2 className="mt-5 font-display text-6xl leading-[0.96]">
            Curate the catalog with confidence.
          </h2>
          <p className="mt-6 max-w-md text-base leading-7 text-white/65">
            Products, media, collections, availability, and publishing—all in
            one invite-only workspace.
          </p>
        </div>
      </section>

      <section className="flex items-center justify-center bg-porcelain px-5 py-12 sm:px-10">
        <div className="w-full max-w-md rounded-[1.75rem] border border-smoke/20 bg-white p-7 shadow-card sm:p-10">
          <BrandMark className="mb-8 lg:hidden" />
          <p className="text-xs font-bold tracking-[0.2em] text-brass-ink uppercase">
            Staff access
          </p>
          <h1 className="mt-3 font-display text-4xl">Welcome back</h1>
          <p className="mt-3 text-sm leading-6 text-smoke">
            Use the email invitation provided by the store owner. Public
            registration is not available.
          </p>

          {!configured ? (
            <div className="mt-6 rounded-xl border border-signal-red/25 bg-signal-red/5 p-4 text-sm leading-6 text-signal-red">
              Supabase is not configured for this deployment. Add the two public
              environment variables before staff sign-in.
            </div>
          ) : null}

          <LoginForm configured={configured} />

          <Link
            className="mt-7 inline-flex min-h-11 items-center text-sm font-semibold underline decoration-antique-brass underline-offset-4"
            href="/"
          >
            Return to the storefront
          </Link>
        </div>
      </section>
    </main>
  );
}
