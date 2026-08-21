"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { getSupabasePublicConfig } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

const loginSchema = z.object({
  email: z.email().trim().toLowerCase(),
  password: z.string().min(1),
});

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

  const supabase = await createClient();
  const { error: signInError } = await supabase.auth.signInWithPassword(
    parsed.data,
  );

  if (signInError) {
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
