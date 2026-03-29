"use server";

import { createSupabaseAdmin } from "@/lib/supabase/server";
import { describeSendEmailResult, sendTransactionalEmail } from "@/lib/email/resend";
import {
  escapeHtmlEmail,
  notifyUserByEmail,
  safeUserGreeting,
  userEmailWrap,
} from "@/lib/email/user-transactional";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const MAX_SIGNUP_EMAIL_NOTE = 2000;

function escapeHtmlForEmail(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatEmailNote(note: string): string {
  const trimmed = note.trim().slice(0, MAX_SIGNUP_EMAIL_NOTE);
  if (!trimmed) return "";
  return `<p style="margin-top:12px;padding-top:12px;border-top:1px solid #e5e7eb;"><strong>Message from the team:</strong><br/><br/>${escapeHtmlForEmail(trimmed).replace(/\r\n|\n|\r/g, "<br/>")}</p>`;
}

/** Form action: hidden notificationId, textarea emailMessage, submit decision=accept|reject */
export async function submitNewSignupDecision(formData: FormData) {
  const notificationId = String(formData.get("notificationId") ?? "").trim();
  const decision = String(formData.get("decision") ?? "").trim();
  const emailMessage = String(formData.get("emailMessage") ?? "")
    .trim()
    .slice(0, MAX_SIGNUP_EMAIL_NOTE);
  let flash = "Something went wrong.";
  try {
    if (!notificationId) {
      flash = "Missing notification.";
    } else if (decision === "accept") {
      flash = await acceptNewSignup(notificationId, emailMessage);
    } else if (decision === "reject") {
      flash = await rejectNewSignup(notificationId, emailMessage);
    } else {
      flash = "Choose Accept or Decline.";
    }
  } catch (e) {
    flash = e instanceof Error ? e.message : "Request failed.";
  }
  redirect(`/admin/notifications?flash=${encodeURIComponent(flash)}`);
}

export type NotificationType =
  | "new_signup"
  | "login"
  | "withdrawal_request"
  | "deposit_proof"
  | "maturity_pending";

export async function createNotification(
  type: NotificationType,
  title: string,
  message: string,
  metadata: Record<string, unknown>,
  userId?: string | null
) {
  const supabase = createSupabaseAdmin();
  const { error } = await supabase.from("notifications").insert({
    type,
    user_id: userId ?? null,
    title,
    message,
    metadata: metadata ?? {},
  });
  if (error) throw new Error(error.message);
  revalidatePath("/admin/notifications");
}

export async function markNotificationRead(id: string) {
  const supabase = createSupabaseAdmin();
  const { error } = await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/notifications");
}

export async function markAllNotificationsRead() {
  const supabase = createSupabaseAdmin();
  const { error } = await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .is("read_at", null);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/notifications");
}

export async function deleteNotification(id: string) {
  const supabase = createSupabaseAdmin();
  const { error } = await supabase.from("notifications").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/notifications");
}

export async function clearAllNotifications() {
  const supabase = createSupabaseAdmin();
  const { error } = await supabase.from("notifications").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  if (error) throw new Error(error.message);
  revalidatePath("/admin/notifications");
}

export async function acceptDeposit(notificationId: string) {
  const supabase = createSupabaseAdmin();
  const { data: sub } = await supabase
    .from("deposit_submissions")
    .select("id, user_id, amount, plan_id")
    .eq("notification_id", notificationId)
    .eq("status", "pending")
    .single();
  if (!sub) throw new Error("Deposit submission not found or already handled.");
  const amount = Number(sub.amount) || 0;
  const userId = sub.user_id as string;
  const planId = sub.plan_id as string | null;

  let planTitle: string | null = null;
  if (planId) {
    const { data: plan } = await supabase.from("plans").select("title").eq("id", planId).maybeSingle();
    planTitle = plan?.title ?? null;
  }
  const note = planTitle
    ? `Deposit for ${planTitle}: $${amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}`
    : amount > 0
      ? `Deposit: $${amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}`
      : "Deposit approved";

  const { data: row } = await supabase
    .from("account_balances")
    .select("id, balance")
    .eq("user_id", userId)
    .eq("account_type", "initial_deposit")
    .single();
  const newBalance = (Number(row?.balance ?? 0)) + amount;
  if (row?.id) {
    await supabase.from("account_balances").update({ balance: newBalance, updated_at: new Date().toISOString() }).eq("id", row.id);
  } else {
    await supabase.from("account_balances").insert({ user_id: userId, account_type: "initial_deposit", balance: newBalance });
  }

  await supabase.from("transfer_history").insert({
    user_id: userId,
    type: "deposit",
    amount,
    status: "completed",
    reference_type: "deposit_submission",
    reference_id: sub.id,
    note,
  });

  await supabase
    .from("deposit_submissions")
    .update({ status: "approved", reviewed_at: new Date().toISOString() })
    .eq("id", sub.id);
  await supabase.from("notifications").update({ read_at: new Date().toISOString() }).eq("id", notificationId);
  revalidatePath("/admin/notifications");

  const { data: profile } = await supabase
    .from("profiles")
    .select("email, full_name")
    .eq("id", userId)
    .maybeSingle();
  if (profile?.email) {
    const greet = safeUserGreeting(profile.full_name as string | null, profile.email as string);
    const inner = `
      <p>Good news — your deposit has been approved.</p>
      <p><strong>${escapeHtmlEmail(note)}</strong></p>
      <p>The funds should now appear on your dashboard under your deposit balance.</p>
    `;
    await notifyUserByEmail(
      profile.email as string,
      "Deposit approved — Bridgecore",
      userEmailWrap(inner, greet)
    );
  }
}

export async function rejectDeposit(notificationId: string, adminNote?: string) {
  const supabase = createSupabaseAdmin();
  const { data: sub } = await supabase
    .from("deposit_submissions")
    .select("id, user_id")
    .eq("notification_id", notificationId)
    .eq("status", "pending")
    .single();
  let rejectUserId: string | null = null;
  if (sub) {
    rejectUserId = sub.user_id as string;
    await supabase
      .from("deposit_submissions")
      .update({ status: "rejected", reviewed_at: new Date().toISOString(), admin_note: adminNote ?? null })
      .eq("id", sub.id);
  }
  await supabase.from("notifications").update({ read_at: new Date().toISOString() }).eq("id", notificationId);
  revalidatePath("/admin/notifications");

  if (rejectUserId) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("email, full_name")
      .eq("id", rejectUserId)
      .maybeSingle();
    if (profile?.email) {
      const greet = safeUserGreeting(profile.full_name as string | null, profile.email as string);
      const trimmedNote = adminNote?.trim();
      const noteBlock = trimmedNote
        ? `<p style="margin-top:12px;padding-top:12px;border-top:1px solid #e5e7eb;"><strong>Message from the team:</strong><br/><br/>${escapeHtmlEmail(trimmedNote).replace(/\r\n|\n|\r/g, "<br/>")}</p>`
        : "";
      const inner = `
        <p>Your recent deposit proof was not approved. You can submit a new proof from your dashboard if needed.</p>
        ${noteBlock}
      `;
      await notifyUserByEmail(
        profile.email as string,
        "Deposit update — Bridgecore",
        userEmailWrap(inner, greet)
      );
    }
  }
}

/** For use as form action (no FormData arg). */
export async function rejectDepositNotification(id: string) {
  await rejectDeposit(id);
}

/** Deduct withdrawal from these balance buckets first (then any other account_type rows). */
const WITHDRAWAL_DEDUCTION_ORDER = ["initial_deposit", "spot", "profit", "mining", "bonus"] as const;

function moneyToCents(value: unknown): number {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  return Math.round(n * 100);
}

function centsToMoney(cents: number): number {
  return Math.round(cents) / 100;
}

type WithdrawalAcceptOptions = { forceWithoutBalance?: boolean };

/** Form: notificationId (hidden), optional forceWithoutBalance checkbox "on" */
export async function submitAcceptWithdrawalForm(formData: FormData) {
  const notificationId = String(formData.get("notificationId") ?? "").trim();
  const forceWithoutBalance = formData.get("forceWithoutBalance") === "on";
  let flash = "Error: Withdrawal approval failed.";
  try {
    if (!notificationId) {
      flash = "Error: Missing withdrawal notification.";
    } else {
      await acceptWithdrawal(notificationId, { forceWithoutBalance });
      flash = forceWithoutBalance
        ? "Withdrawal approved without debiting account balances."
        : "Withdrawal approved successfully.";
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Withdrawal approval failed.";
    flash = msg.toLowerCase().startsWith("error") ? msg : `Error: ${msg}`;
  }
  redirect(`/admin/notifications?flash=${encodeURIComponent(flash)}`);
}

export async function acceptWithdrawal(
  notificationId: string,
  options: WithdrawalAcceptOptions = {}
) {
  const supabase = createSupabaseAdmin();
  const { data: req } = await supabase
    .from("withdrawal_requests")
    .select("id, user_id, amount, status")
    .eq("notification_id", notificationId)
    .single();
  if (!req || (req.status as string) !== "pending") {
    throw new Error("Withdrawal request not found or already handled.");
  }
  const userId = req.user_id as string;
  const amountCents = moneyToCents(req.amount);
  const amount = centsToMoney(amountCents);
  if (amountCents <= 0) {
    throw new Error("Invalid withdrawal amount.");
  }

  if (!options.forceWithoutBalance) {
    const { data: balRows } = await supabase
      .from("account_balances")
      .select("id, account_type, balance")
      .eq("user_id", userId);

    type Bucket = { id: string; account_type: string; balanceCents: number };
    const buckets: Bucket[] = (balRows ?? []).map((r) => ({
      id: r.id as string,
      account_type: String(r.account_type),
      balanceCents: Math.max(0, moneyToCents(r.balance)),
    }));

    const totalAvailableCents = buckets.reduce((s, b) => s + b.balanceCents, 0);

    if (totalAvailableCents < amountCents) {
      const byType = buckets.reduce<Record<string, number>>((acc, b) => {
        acc[b.account_type] = (acc[b.account_type] ?? 0) + b.balanceCents / 100;
        return acc;
      }, {});
      const detail = Object.entries(byType)
        .map(([k, v]) => `${k}: $${v.toFixed(2)}`)
        .join("; ");
      throw new Error(
        `Insufficient balance to approve. Requested: $${amount.toFixed(2)}. Available: $${centsToMoney(totalAvailableCents).toFixed(2)}. ${detail ? `Breakdown: ${detail}. ` : ""}If you already paid this user outside the platform, use “Approve without debiting balance” below.`
      );
    }

    const orderIndex = (t: string) => {
      const i = WITHDRAWAL_DEDUCTION_ORDER.indexOf(t as (typeof WITHDRAWAL_DEDUCTION_ORDER)[number]);
      return i === -1 ? 999 : i;
    };
    const sorted = [...buckets].sort((a, b) => {
      const o = orderIndex(a.account_type) - orderIndex(b.account_type);
      if (o !== 0) return o;
      return a.id.localeCompare(b.id);
    });

    let remainingCents = amountCents;
    const updatedAt = new Date().toISOString();
    for (const bucket of sorted) {
      if (remainingCents <= 0) break;
      if (bucket.balanceCents <= 0) continue;
      const take = Math.min(bucket.balanceCents, remainingCents);
      const newBal = centsToMoney(bucket.balanceCents - take);
      remainingCents -= take;
      await supabase
        .from("account_balances")
        .update({ balance: newBal, updated_at: updatedAt })
        .eq("id", bucket.id);
    }

    if (remainingCents > 0) {
      throw new Error("Could not apply withdrawal to balances. Please try again or use manual approval.");
    }
  }

  if (!options.forceWithoutBalance) {
    await supabase.from("transfer_history").insert({
      user_id: userId,
      type: "withdrawal",
      amount: -amount,
      status: "completed",
      reference_type: "withdrawal_request",
      reference_id: req.id,
      note: `Withdrawal approved: $${amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
    });
  }

  await supabase
    .from("withdrawal_requests")
    .update({ status: "approved", reviewed_at: new Date().toISOString() })
    .eq("id", req.id);
  await supabase.from("notifications").update({ read_at: new Date().toISOString() }).eq("id", notificationId);
  revalidatePath("/admin/notifications");

  const { data: profile } = await supabase
    .from("profiles")
    .select("email, full_name")
    .eq("id", userId)
    .maybeSingle();
  if (profile?.email) {
    const greet = safeUserGreeting(profile.full_name as string | null, profile.email as string);
    const amt = amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const inner = `
      <p>Your withdrawal request for <strong>$${escapeHtmlEmail(amt)}</strong> has been approved.</p>
      <p>Processing may take a short time to reach your selected payout method. If you have questions, reply through support from your dashboard.</p>
    `;
    await notifyUserByEmail(
      profile.email as string,
      "Withdrawal approved — Bridgecore",
      userEmailWrap(inner, greet)
    );
  }
}

export async function rejectWithdrawal(notificationId: string) {
  const supabase = createSupabaseAdmin();
  const { data: req } = await supabase
    .from("withdrawal_requests")
    .select("id, user_id, amount")
    .eq("notification_id", notificationId)
    .eq("status", "pending")
    .single();
  let rejectedUserId: string | null = null;
  let rejectedAmount = 0;
  if (req) {
    rejectedUserId = req.user_id as string;
    rejectedAmount = Number(req.amount) || 0;
    await supabase
      .from("withdrawal_requests")
      .update({ status: "rejected", reviewed_at: new Date().toISOString() })
      .eq("id", req.id);
  }
  await supabase.from("notifications").update({ read_at: new Date().toISOString() }).eq("id", notificationId);
  revalidatePath("/admin/notifications");

  if (rejectedUserId) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("email, full_name")
      .eq("id", rejectedUserId)
      .maybeSingle();
    if (profile?.email) {
      const greet = safeUserGreeting(profile.full_name as string | null, profile.email as string);
      const amt = rejectedAmount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      const inner = `
        <p>Your withdrawal request for <strong>$${escapeHtmlEmail(amt)}</strong> was not approved.</p>
        <p>Your balance was not debited for this request. You can review your account or submit a new request from your dashboard if appropriate.</p>
      `;
      await notifyUserByEmail(
        profile.email as string,
        "Withdrawal update — Bridgecore",
        userEmailWrap(inner, greet)
      );
    }
  }
}

/** For use as form action. */
export async function rejectWithdrawalNotification(id: string) {
  await rejectWithdrawal(id);
}

export async function acceptNewSignup(notificationId: string, emailNote = ""): Promise<string> {
  const supabase = createSupabaseAdmin();
  const { data: n } = await supabase
    .from("notifications")
    .select("id, type, user_id, read_at")
    .eq("id", notificationId)
    .single();
  if (!n || n.type !== "new_signup" || n.read_at) {
    throw new Error("Signup notification not found or already handled.");
  }
  const userId = n.user_id as string | null;
  if (!userId) throw new Error("Missing user for this signup.");

  const { data: profile } = await supabase
    .from("profiles")
    .select("account_status, email, full_name")
    .eq("id", userId)
    .maybeSingle();

  if (!profile || profile.account_status !== "pending_approval") {
    await supabase.from("notifications").update({ read_at: new Date().toISOString() }).eq("id", notificationId);
    revalidatePath("/admin/notifications");
    revalidatePath("/admin/users");
    return "Notification cleared (user missing or already processed).";
  }

  await supabase
    .from("profiles")
    .update({ account_status: "approved" })
    .eq("id", userId);
  await supabase.from("notifications").update({ read_at: new Date().toISOString() }).eq("id", notificationId);

  const userEmail = profile.email as string;
  const appUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  let emailLine = "No user email on file.";
  if (userEmail) {
    const name = (profile.full_name as string)?.trim() || userEmail;
    const safeName = name.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const noteBlock = formatEmailNote(emailNote);
    const sent = await sendTransactionalEmail(
      userEmail,
      "Your account has been approved",
      `
        <p>Hi ${safeName},</p>
        <p>Your registration has been approved. You can <a href="${appUrl}/login">sign in here</a>.</p>
        ${noteBlock}
      `,
    );
    emailLine = describeSendEmailResult(sent);
  }

  revalidatePath("/admin/notifications");
  revalidatePath("/admin/users");
  return `Approved. ${emailLine}`;
}

/** Decline: notify by email (if possible), then delete auth user so the email can register again. */
export async function rejectNewSignup(notificationId: string, emailNote = ""): Promise<string> {
  const supabase = createSupabaseAdmin();
  const { data: n } = await supabase
    .from("notifications")
    .select("id, type, user_id, read_at")
    .eq("id", notificationId)
    .single();
  if (!n || n.type !== "new_signup" || n.read_at) {
    throw new Error("Signup notification not found or already handled.");
  }
  const userId = n.user_id as string | null;
  if (!userId) throw new Error("Missing user for this signup.");

  const { data: profile } = await supabase
    .from("profiles")
    .select("account_status, email, full_name")
    .eq("id", userId)
    .maybeSingle();

  if (!profile || profile.account_status !== "pending_approval") {
    await supabase.from("notifications").update({ read_at: new Date().toISOString() }).eq("id", notificationId);
    revalidatePath("/admin/notifications");
    return "Notification cleared (user missing or already processed).";
  }

  const userEmail = profile.email as string;
  let emailLine = "No user email on file.";
  if (userEmail) {
    const name = (profile.full_name as string)?.trim() || userEmail;
    const safeName = name.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const noteBlock = formatEmailNote(emailNote);
    const sent = await sendTransactionalEmail(
      userEmail,
      "Update on your registration",
      `
        <p>Hi ${safeName},</p>
        <p>We are unable to approve your registration at this time. You may create a new account again with the same email if you wish. If you have questions, please contact support.</p>
        ${noteBlock}
      `,
    );
    emailLine = describeSendEmailResult(sent);
  }

  const { error: delErr } = await supabase.auth.admin.deleteUser(userId);
  if (delErr) {
    throw new Error(`Could not remove user account: ${delErr.message}`);
  }

  await supabase.from("notifications").update({ read_at: new Date().toISOString() }).eq("id", notificationId);

  revalidatePath("/admin/notifications");
  revalidatePath("/admin/users");
  return `Declined. User account removed from the system so they can register again. ${emailLine}`;
}
