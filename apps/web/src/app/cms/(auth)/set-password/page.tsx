import type { Metadata } from "next";

import { PasswordForm } from "@/app/cms/(auth)/set-password/password-form";
import { BrandMark } from "@/components/brand/brand-mark";

export const metadata: Metadata = {
  title: "Set staff password",
  robots: { follow: false, index: false },
};

export default function SetPasswordPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-charcoal p-5">
      <section className="w-full max-w-md rounded-[1.75rem] bg-porcelain p-7 shadow-card sm:p-10">
        <BrandMark />
        <p className="mt-8 text-xs font-bold tracking-[0.18em] text-brass-ink uppercase">
          Staff invitation
        </p>
        <h1 className="mt-3 font-display text-4xl">Secure your account</h1>
        <p className="mt-3 text-sm leading-6 text-smoke">
          Choose a password for future email/password sign-in. This invitation
          session is verified before any account change.
        </p>
        <PasswordForm />
      </section>
    </main>
  );
}
