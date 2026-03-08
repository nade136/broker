"use server";

import { createSupabaseAdmin } from "@/lib/supabase/server";
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
  return { ok: true };
}
