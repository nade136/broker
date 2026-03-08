"use server";

import { createSupabaseAdmin } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function approveKyc(submissionId: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = createSupabaseAdmin();
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
  return { ok: true };
}

export async function rejectKyc(submissionId: string, reason: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = createSupabaseAdmin();
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
