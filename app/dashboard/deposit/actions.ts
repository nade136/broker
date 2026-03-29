"use server";

import { createSupabaseAdmin } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

async function getAdminEmail(): Promise<string | null> {
  const envAdmin = process.env.ADMIN_EMAIL?.trim();
  if (envAdmin) return envAdmin;
  const admin = createSupabaseAdmin();
  const { data } = await admin
    .from("profiles")
    .select("email")
    .eq("role", "admin")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  return data?.email?.trim() ?? null;
}

async function sendAdminEmail(
  subject: string,
  html: string,
  toEmail: string
): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  if (!key) return false;
  try {
    const { Resend } = await import("resend");
    const resend = new Resend(key);
    const from = process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev";
    await resend.emails.send({ from, to: toEmail, subject, html });
    return true;
  } catch {
    return false;
  }
}

export type SubmitDepositProofResult =
  | { ok: true; message: string }
  | { ok: false; error: string };

export async function submitDepositProof(
  userId: string,
  userEmail: string,
  userName: string,
  paymentMethod: string,
  amount: string,
  screenshotPath: string,
  planId?: string | null
): Promise<SubmitDepositProofResult> {
  if (!screenshotPath?.trim()) {
    return { ok: false, error: "Please upload a payment screenshot." };
  }

  const supabase = createSupabaseAdmin();
  const { data: notif, error: notifError } = await supabase
    .from("notifications")
    .insert({
      type: "deposit_proof",
      user_id: userId,
      title: "Deposit proof submitted",
      message: `${userName || userEmail} submitted a payment screenshot for ${paymentMethod}.`,
      metadata: {
        payment_method: paymentMethod,
        amount: amount || "—",
        screenshot_path: screenshotPath,
        user_email: userEmail,
        plan_id: planId ?? null,
      },
    })
    .select("id")
    .single();

  if (notifError || !notif) {
    return { ok: false, error: notifError?.message ?? "Failed to create notification." };
  }

  const amountNum = parseFloat(String(amount).replace(/,/g, "")) || null;
  const { error: subError } = await supabase.from("deposit_submissions").insert({
    user_id: userId,
    notification_id: notif.id,
    plan_id: planId || null,
    amount: amountNum,
    payment_method: paymentMethod,
    screenshot_path: screenshotPath,
    status: "pending",
  });

  if (subError) {
    return { ok: false, error: subError.message };
  }

  revalidatePath("/admin/notifications");

  const adminEmail = await getAdminEmail();
  if (adminEmail) {
    const appUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
    const subject = `Deposit proof from ${userName || userEmail}`;
    const html = `
      <p><strong>Deposit proof submitted</strong></p>
      <p>From: ${userName || userEmail} (${userEmail})</p>
      <p>Payment method: ${paymentMethod}</p>
      <p>Amount: ${amount || "—"}</p>
      <p><a href="${screenshotPath}">View payment screenshot</a></p>
      <p><a href="${appUrl}/admin/notifications">View all notifications</a></p>
    `;
    await sendAdminEmail(subject, html, adminEmail);
  }

  return {
    ok: true,
    message: "Proof sent to admin. You will be notified once it is reviewed.",
  };
}
