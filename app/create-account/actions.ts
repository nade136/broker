"use server";

import { createSupabaseAdmin } from "@/lib/supabase/server";
import { describeSendEmailResult, getAdminNotificationEmail, sendTransactionalEmail } from "@/lib/email/resend";

export type NotifyAdminSignupResult =
  | { ok: true }
  | { ok: false; reason: string };

/**
 * After sign-up: email admin if a matching new_signup notification exists.
 * Prefer matching by auth user id (reliable); fall back to metadata email.
 */
export async function notifyAdminNewUserSignup(
  email: string,
  fullName: string,
  newUserId?: string | null
): Promise<NotifyAdminSignupResult> {
  const trimmed = email?.trim();
  if (!trimmed) return { ok: false, reason: "Missing email." };

  const admin = createSupabaseAdmin();

  let found = false;
  if (newUserId) {
    const { data: byUser } = await admin
      .from("notifications")
      .select("id")
      .eq("type", "new_signup")
      .eq("user_id", newUserId)
      .limit(1)
      .maybeSingle();
    found = !!byUser;
  }
  if (!found) {
    const { data: rows } = await admin
      .from("notifications")
      .select("id")
      .eq("type", "new_signup")
      .filter("metadata->>email", "eq", trimmed)
      .order("created_at", { ascending: false })
      .limit(1);
    found = !!(rows?.length);
  }
  if (!found) {
    return {
      ok: false,
      reason:
        "Could not find the new-signup notification yet (try again in a moment) or the signup did not complete.",
    };
  }

  const to = await getAdminNotificationEmail();
  if (!to) {
    return {
      ok: false,
      reason:
        "No team notification email configured. Set ADMIN_EMAIL in your environment or ensure a staff profile has an email.",
    };
  }

  const appUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const safeName = (fullName || trimmed).replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const subject = `New account registration: ${safeName}`;
  const html = `
    <p><strong>New user signed up</strong></p>
    <p>Name: ${safeName}</p>
    <p>Email: ${trimmed.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>
    <p>Approve or decline in <a href="${appUrl}/admin/notifications">Notifications</a>.</p>
  `;
  const sent = await sendTransactionalEmail(to, subject, html);
  if (!sent.ok) {
    return { ok: false, reason: describeSendEmailResult(sent) };
  }
  return { ok: true };
}
