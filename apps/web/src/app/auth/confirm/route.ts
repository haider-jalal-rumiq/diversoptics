import type { EmailOtpType } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

const allowedTypes = new Set<EmailOtpType>([
  "email",
  "invite",
  "recovery",
  "signup",
]);

export async function GET(request: NextRequest) {
  const tokenHash = request.nextUrl.searchParams.get("token_hash");
  const rawType = request.nextUrl.searchParams.get(
    "type",
  ) as EmailOtpType | null;
  const requestedNext = request.nextUrl.searchParams.get("next");
  const safeNext =
    requestedNext?.startsWith("/cms/") && !requestedNext.startsWith("//")
      ? requestedNext
      : "/cms";
  const redirectTo = request.nextUrl.clone();
  redirectTo.search = "";

  if (tokenHash && rawType && allowedTypes.has(rawType)) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: rawType,
    });
    if (!error) {
      redirectTo.pathname = safeNext;
      return NextResponse.redirect(redirectTo);
    }
  }

  redirectTo.pathname = "/cms/login";
  redirectTo.searchParams.set("error", "invalid_link");
  return NextResponse.redirect(redirectTo);
}
