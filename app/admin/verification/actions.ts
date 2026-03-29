"use server";

import { createSupabaseAdmin } from "@/lib/supabase/server";
import {
  escapeHtmlEmail,
  notifyUserByEmail,
  safeUserGreeting,
  userEmailWrap,
} from "@/lib/email/user-transactional";
import { revalidatePath } from "next/cache";

export async function approveKyc(submissionId: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = createSupabaseAdmin();
  const { data: row } = await supabase.from("kyc_submissions").select("user_id").eq("id", submissionId).maybeSingle();
  const { error } = await supabase
    .from("kyc_submissions")
    .update({
      status: "approved",
      reviewed_at: new Date().toISOString(),
      rejection_reason: null,
    })
    .eq("id", submissionId);

  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/verification");
  revalidatePath("/dashboard/verification");

  if (row?.user_id) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("email, full_name")
      .eq("id", row.user_id)
      .maybeSingle();
    if (profile?.email) {
      const greet = safeUserGreeting(profile.full_name as string | null, profile.email as string);
      const inner = `
        <p>Your identity verification has been <strong>approved</strong>.</p>
        <p>Thank you for completing this step. You can continue using your Bridgecore account as usual.</p>
      `;
      await notifyUserByEmail(
        profile.email as string,
        "Verification approved — Bridgecore",
        userEmailWrap(inner, greet)
      );
    }
  }

  return { ok: true };
}

export async function rejectKyc(submissionId: string, reason: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = createSupabaseAdmin();
  const { data: row } = await supabase.from("kyc_submissions").select("user_id").eq("id", submissionId).maybeSingle();
  const { error } = await supabase
    .from("kyc_submissions")
    .update({
      status: "rejected",
      reviewed_at: new Date().toISOString(),
      rejection_reason: reason?.trim() || null,
    })
    .eq("id", submissionId);

  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/verification");
  revalidatePath("/dashboard/verification");

  if (row?.user_id) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("email, full_name")
      .eq("id", row.user_id)
      .maybeSingle();
    if (profile?.email) {
      const greet = safeUserGreeting(profile.full_name as string | null, profile.email as string);
      const trimmed = reason?.trim();
      const reasonBlock = trimmed
        ? `<p style="margin-top:12px;padding-top:12px;border-top:1px solid #e5e7eb;"><strong>Reason:</strong><br/><br/>${escapeHtmlEmail(trimmed).replace(/\r\n|\n|\r/g, "<br/>")}</p>`
        : "";
      const inner = `
        <p>We were unable to approve your identity verification with the documents provided.</p>
        ${reasonBlock}
        <p>You can upload new documents from your dashboard when you are ready.</p>
      `;
      await notifyUserByEmail(
        profile.email as string,
        "Verification update — Bridgecore",
        userEmailWrap(inner, greet)
      );
    }
  }

  return { ok: true };
}

/** Remove a KYC submission so the user can submit again. */
export async function clearKyc(submissionId: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = createSupabaseAdmin();
  const { error } = await supabase.from("kyc_submissions").delete().eq("id", submissionId);

  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/verification");
  revalidatePath("/dashboard/verification");
  return { ok: true };
}
