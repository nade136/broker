"use server";

import { createClient } from "@supabase/supabase-js";
import { createSupabaseAdmin } from "@/lib/supabase/server";

const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;

export type CreateAdminResult = { ok: true } | { ok: false; error: string };

/** Create a new user and set their role to admin. Caller must be an existing admin (pass their access token). */
export async function createAdminUser(
  email: string,
  password: string,
  accessToken: string,
): Promise<CreateAdminResult> {
  if (!email?.trim() || !password?.trim()) {
    return { ok: false, error: "Email and password required." };
  }

  const admin = createSupabaseAdmin();

  const clientWithToken = createClient(url, anonKey, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
  });
  const {
    data: { user: caller },
    error: userError,
  } = await clientWithToken.auth.getUser();
  if (userError || !caller) {
    return { ok: false, error: "Invalid session. Please sign in again." };
  }

  const { data: profile } = await admin
    .from("profiles")
    .select("role")
    .eq("id", caller.id)
    .single();
  if (profile?.role !== "admin") {
    return { ok: false, error: "Only admins can create new admins." };
  }

  const {
    data: { user: newUser },
    error: createError,
  } = await admin.auth.admin.createUser({
    email: email.trim(),
    password,
    email_confirm: true,
  });
  if (createError) {
    return { ok: false, error: createError.message };
  }
  if (!newUser) {
    return { ok: false, error: "Failed to create user." };
  }

  const { error: updateError } = await admin
    .from("profiles")
    .update({ role: "admin" })
    .eq("id", newUser.id);
  if (updateError) {
    return {
      ok: false,
      error: "User created but failed to set as admin: " + updateError.message,
    };
  }

  return { ok: true };
}
