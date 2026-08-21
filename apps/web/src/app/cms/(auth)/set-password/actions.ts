"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

const passwordSchema = z
  .object({
    confirmPassword: z.string(),
    password: z
      .string()
      .min(12)
      .regex(/[a-z]/)
      .regex(/[A-Z]/)
      .regex(/[0-9]/)
      .regex(/[^A-Za-z0-9]/),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "The passwords do not match.",
    path: ["confirmPassword"],
  });

export type PasswordState = { message?: string };

export async function setPassword(
  _previousState: PasswordState,
  formData: FormData,
): Promise<PasswordState> {
  const parsed = passwordSchema.safeParse({
    confirmPassword: formData.get("confirmPassword"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return {
      message: parsed.error.issues[0]?.message ?? "Use a stronger password.",
    };
  }

  const supabase = await createClient();
  const { data: claims, error: claimsError } = await supabase.auth.getClaims();
  if (claimsError || !claims?.claims)
    return { message: "The invitation session has expired." };
  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });
  if (error) return { message: "The password could not be saved." };
  redirect("/cms");
}
