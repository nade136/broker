"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { createSupabaseAdmin } from "@/lib/supabase/server";

const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;

type AdminGate =
  | { ok: true; callerId: string }
  | { ok: true; callerId: null; viaAdminCookie: true }
  | { ok: false; error: string };

/** Prefer Supabase JWT; if missing (e.g. different port, expired storage), allow same admin_session cookie as middleware. */
async function assertAdminCaller(accessToken: string | null | undefined): Promise<AdminGate> {
  const admin = createSupabaseAdmin();

  if (accessToken?.trim()) {
    const clientWithToken = createClient(url, anonKey, {
      global: { headers: { Authorization: `Bearer ${accessToken}` } },
    });
    const {
      data: { user: caller },
      error: userError,
    } = await clientWithToken.auth.getUser();
    if (!userError && caller) {
      const { data: profile } = await admin
        .from("profiles")
        .select("role")
        .eq("id", caller.id)
        .single();
      if (profile?.role === "admin") {
        return { ok: true, callerId: caller.id };
      }
      return { ok: false, error: "Only admins can perform this action." };
    }
  }

  const cookieStore = await cookies();
  if (cookieStore.get("admin_session")?.value === "1") {
    return { ok: true, callerId: null, viaAdminCookie: true };
  }

  return {
    ok: false,
    error:
      "Admin session not found. Sign out and sign in again at /admin/login, and use the same site URL you used to log in (e.g. if you use port 3001, always use 3001).",
  };
}

export type CreateAdminResult = { ok: true } | { ok: false; error: string };

/** Create a new user and set their role to admin. */
export async function createAdminUser(
  email: string,
  password: string,
  accessToken: string | null | undefined,
): Promise<CreateAdminResult> {
  if (!email?.trim() || !password?.trim()) {
    return { ok: false, error: "Email and password required." };
  }

  const gate = await assertAdminCaller(accessToken);
  if (!gate.ok) return { ok: false, error: gate.error };

  const admin = createSupabaseAdmin();

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
    .update({ role: "admin", account_status: "approved" })
    .eq("id", newUser.id);
  if (updateError) {
    return {
      ok: false,
      error: "User created but failed to set as admin: " + updateError.message,
    };
  }

  return { ok: true };
}

export type DeleteUserResult = { ok: true } | { ok: false; error: string };

/** Deletes the auth user (cascades profile and related rows). Caller must be an admin. */
export async function deleteUserAccount(
  targetUserId: string,
  accessToken: string | null | undefined,
): Promise<DeleteUserResult> {
  if (!targetUserId?.trim()) {
    return { ok: false, error: "Invalid user." };
  }

  const gate = await assertAdminCaller(accessToken);
  if (!gate.ok) return { ok: false, error: gate.error };

  if (gate.callerId !== null && gate.callerId === targetUserId) {
    return { ok: false, error: "You cannot delete your own account from this list." };
  }

  const admin = createSupabaseAdmin();

  const { data: target } = await admin
    .from("profiles")
    .select("role")
    .eq("id", targetUserId)
    .maybeSingle();
  if (!target) {
    return { ok: false, error: "User not found." };
  }
  if (target.role === "admin") {
    return {
      ok: false,
      error: "Cannot delete an admin here. Demote them to user first (e.g. in Supabase), or remove admin in SQL.",
    };
  }

  const { error: delErr } = await admin.auth.admin.deleteUser(targetUserId);
  if (delErr) {
    return { ok: false, error: delErr.message };
  }

  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${targetUserId}`);
  return { ok: true };
}
