"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

import { hashIdentifier, readClientAddress } from "@/lib/security/identifiers";
import { consumeRateLimit } from "@/lib/security/rate-limit";
import { logSecurityEvent } from "@/lib/security/security-log";
import { getSupabasePublicConfig } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

/** Per account and per address, so one mailbox cannot be guessed endlessly from many addresses. */
const SIGN_IN_LIMIT_PER_EMAIL = 10;
const SIGN_IN_LIMIT_PER_ADDRESS = 40;
const SIGN_IN_WINDOW_SECONDS = 15 * 60;

const loginSchema = z.object({
  email: z.email().trim().toLowerCase(),
  password: z.string().min(1),
});

/** Counts the attempt against the account first, so a blocked account never costs the address budget. */
async function isSignInAllowed(
  emailHash: string,
  clientAddress: string | null,
): Promise<boolean> {
  const accountAllowed = await consumeRateLimit({
    bucket: `login-email:${emailHash}`,
    limit: SIGN_IN_LIMIT_PER_EMAIL,
    scope: "login-email",
    windowSeconds: SIGN_IN_WINDOW_SECONDS,
  });

  if (!accountAllowed || clientAddress === null) return accountAllowed;

  return consumeRateLimit({
    bucket: `login-ip:${hashIdentifier("login-ip", clientAddress)}`,
    limit: SIGN_IN_LIMIT_PER_ADDRESS,
    scope: "login-ip",
    windowSeconds: SIGN_IN_WINDOW_SECONDS,
  });
}

export type LoginState = {
  fieldErrors?: Partial<Record<"email" | "password", string>>;
  message?: string;
};

export async function signIn(
  _previousState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  if (!getSupabasePublicConfig()) {
    return { message: "The CMS environment is not connected yet." };
  }

  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    const flattened = z.flattenError(parsed.error);
    return {
      fieldErrors: {
        email: flattened.fieldErrors.email?.[0],
        password: flattened.fieldErrors.password?.[0],
      },
      message: "Check the highlighted fields.",
    };
  }

  const emailHash = hashIdentifier("login-email", parsed.data.email);
  const clientAddress = readClientAddress(await headers());

  if (!(await isSignInAllowed(emailHash, clientAddress))) {
    return {
      message: "Too many sign-in attempts. Wait 15 minutes and try again.",
    };
  }

  const supabase = await createClient();
  const { error: signInError } = await supabase.auth.signInWithPassword(
    parsed.data,
  );

  if (signInError) {
    logSecurityEvent("auth.sign_in_failed", { emailHash });

    return { message: "The email or password is not valid." };
  }

  const { data: claimData, error: claimError } =
    await supabase.auth.getClaims();
  const subject = claimData?.claims?.sub;

  if (claimError || typeof subject !== "string") {
    await supabase.auth.signOut();
    return { message: "We could not verify this account." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("status")
    .eq("id", subject)
    .maybeSingle();

  if (profile?.status !== "active") {
    await supabase.auth.signOut();
    return {
      message: "This staff account is awaiting owner activation.",
    };
  }

  redirect("/cms");
}
