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

export type SubmitWithdrawalRequestResult =
  | { ok: true; message: string }
  | { ok: false; error: string };

export async function submitWithdrawalRequest(
  userId: string,
  userEmail: string,
  userName: string,
  method: string,
  amount: string,
  payoutDetails: string
): Promise<SubmitWithdrawalRequestResult> {
  if (!method?.trim()) {
    return { ok: false, error: "Please select a withdrawal method." };
  }
  if (!amount?.trim()) {
    return { ok: false, error: "Please enter an amount." };
  }
  if (!payoutDetails?.trim()) {
    return { ok: false, error: "Please enter your payout details (bank account, wallet address, etc.)." };
  }

  const numAmount = parseFloat(amount.trim());
  if (isNaN(numAmount) || numAmount <= 0) {
    return { ok: false, error: "Please enter a valid amount." };
  }

  const supabase = createSupabaseAdmin();

  const { data: notif, error: notifErr } = await supabase
    .from("notifications")
    .insert({
      type: "withdrawal_request",
      user_id: userId,
      title: "Withdrawal request",
      message: `${userName || userEmail} requested a withdrawal of $${amount} via ${method}. Payout details: ${payoutDetails.trim()}`,
      metadata: {
        method,
        amount: amount.trim(),
        payout_details: payoutDetails.trim(),
        user_email: userEmail,
        user_name: userName || null,
      },
    })
    .select("id")
    .single();

  if (notifErr || !notif?.id) {
    return { ok: false, error: notifErr?.message ?? "Failed to create notification." };
  }

  const { error: reqErr } = await supabase.from("withdrawal_requests").insert({
    user_id: userId,
    notification_id: notif.id,
    method: method.trim(),
    amount: numAmount,
    payout_details: payoutDetails.trim(),
    status: "pending",
  });

  if (reqErr) {
    return { ok: false, error: reqErr.message };
  }

  revalidatePath("/admin/notifications");

  const adminEmail = await getAdminEmail();
  if (adminEmail) {
    const appUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
    const subject = `Withdrawal request from ${userName || userEmail}`;
    const html = `
      <p><strong>Withdrawal request</strong></p>
      <p><strong>From:</strong> ${userName || "(no name)"} (${userEmail})</p>
      <p><strong>Method:</strong> ${method}</p>
      <p><strong>Amount:</strong> $${amount}</p>
      <p><strong>Payout details (where to send):</strong> ${payoutDetails.trim()}</p>
      <p><a href="${appUrl}/admin/notifications">Review request</a></p>
    `;
    await sendAdminEmail(subject, html, adminEmail);
  }

  return {
    ok: true,
    message: "Request submitted. You will be notified once it is processed.",
  };
}
