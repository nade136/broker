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

/**
 * Prefer Supabase JWT when it belongs to role admin.
 * Fall back to admin_session cookie (same as middleware): only one Supabase session exists per origin,
 * so logging into the user dashboard can replace the staff session while the staff cookie is still set.
 */
async function assertAdminCaller(accessToken: string | null | undefined): Promise<AdminGate> {
  const admin = createSupabaseAdmin();
  const cookieStore = await cookies();
  const hasStaffCookie = cookieStore.get("admin_session")?.value === "1";

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
        .maybeSingle();
      if (profile?.role === "admin") {
        return { ok: true, callerId: caller.id };
      }
      if (hasStaffCookie) {
        return { ok: true, callerId: null, viaAdminCookie: true };
      }
      return { ok: false, error: "Only staff can perform this action." };
    }
  }

  if (hasStaffCookie) {
    return { ok: true, callerId: null, viaAdminCookie: true };
  }

  return {
    ok: false,
    error:
      "Staff session not found. Sign out and sign in again from the staff sign-in page, using the same site URL you used to log in (e.g. if you use port 3001, always use 3001).",
  };
}

export type CreateAdminResult = { ok: true } | { ok: false; error: string };

/** Create a new user and grant staff (role admin in DB). */
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
      error: "User created but failed to grant staff access: " + updateError.message,
    };
  }

  revalidatePath("/admin/users");
  return { ok: true };
}

export type DeleteUserResult = { ok: true } | { ok: false; error: string };

/** Deletes the auth user (cascades profile and related rows). Caller must be staff. */
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
      error: "Cannot delete a staff account here. Demote them to user first (e.g. in Supabase), or adjust the role in SQL.",
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
