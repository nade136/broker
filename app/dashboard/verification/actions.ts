"use server";

import { createSupabaseAdmin } from "@/lib/supabase/server";
import {
  appBaseUrl,
  notifyUserByEmail,
  safeUserGreeting,
  userEmailWrap,
} from "@/lib/email/user-transactional";
import { revalidatePath } from "next/cache";

export type SubmitKycResult = { ok: true } | { ok: false; error: string };

export async function submitKyc(userId: string, idDocumentUrl: string, selfieUrl: string | null): Promise<SubmitKycResult> {
  if (!userId?.trim()) {
    return { ok: false, error: "You must be logged in." };
  }
  if (!idDocumentUrl?.trim()) {
    return { ok: false, error: "Please upload an ID document." };
  }

  const supabase = createSupabaseAdmin();
  const { data: existing } = await supabase
    .from("kyc_submissions")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("kyc_submissions")
      .update({
        status: "pending",
        id_document_url: idDocumentUrl.trim(),
        selfie_url: selfieUrl?.trim() || null,
        submitted_at: new Date().toISOString(),
        reviewed_at: null,
        reviewed_by: null,
        rejection_reason: null,
      })
      .eq("user_id", userId);
    if (error) return { ok: false, error: error.message };
  } else {
    const { error } = await supabase.from("kyc_submissions").insert({
      user_id: userId,
      status: "pending",
      id_document_url: idDocumentUrl.trim(),
      selfie_url: selfieUrl?.trim() || null,
    });
    if (error) return { ok: false, error: error.message };
  }

  revalidatePath("/dashboard/verification");
  revalidatePath("/admin/verification");

  const { data: profile } = await supabase
    .from("profiles")
    .select("email, full_name")
    .eq("id", userId)
    .maybeSingle();
  if (profile?.email) {
    const greet = safeUserGreeting(profile.full_name as string | null, profile.email as string);
    const inner = `
      <p>We received your identity verification documents and will review them shortly.</p>
      <p>We will email you again once there is a decision. You can also check status on your <a href="${appBaseUrl()}/dashboard/verification">Verification</a> page.</p>
    `;
    await notifyUserByEmail(
      profile.email as string,
      "Verification documents received — Bridgecore",
      userEmailWrap(inner, greet)
    );
  }

  return { ok: true };
}
