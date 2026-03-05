"use server";

import { createSupabaseAdmin } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

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
      : "Deposit approved by admin";

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
}

export async function rejectDeposit(notificationId: string, adminNote?: string) {
  const supabase = createSupabaseAdmin();
  const { data: sub } = await supabase
    .from("deposit_submissions")
    .select("id")
    .eq("notification_id", notificationId)
    .eq("status", "pending")
    .single();
  if (sub) {
    await supabase
      .from("deposit_submissions")
      .update({ status: "rejected", reviewed_at: new Date().toISOString(), admin_note: adminNote ?? null })
      .eq("id", sub.id);
  }
  await supabase.from("notifications").update({ read_at: new Date().toISOString() }).eq("id", notificationId);
  revalidatePath("/admin/notifications");
}

/** For use as form action (no FormData arg). */
export async function rejectDepositNotification(id: string) {
  await rejectDeposit(id);
}

export async function acceptWithdrawal(notificationId: string) {
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
  const amount = Number(req.amount) || 0;

  const { data: row } = await supabase
    .from("account_balances")
    .select("id, balance")
    .eq("user_id", userId)
    .eq("account_type", "initial_deposit")
    .single();
  const currentBalance = Number(row?.balance ?? 0);
  if (currentBalance < amount) {
    throw new Error("Insufficient user balance to approve this withdrawal.");
  }
  const newBalance = currentBalance - amount;
  if (row?.id) {
    await supabase
      .from("account_balances")
      .update({ balance: newBalance, updated_at: new Date().toISOString() })
      .eq("id", row.id);
  }

  await supabase.from("transfer_history").insert({
    user_id: userId,
    type: "withdrawal",
    amount: -amount,
    status: "completed",
    reference_type: "withdrawal_request",
    reference_id: req.id,
    note: `Withdrawal approved: $${amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
  });

  await supabase
    .from("withdrawal_requests")
    .update({ status: "approved", reviewed_at: new Date().toISOString() })
    .eq("id", req.id);
  await supabase.from("notifications").update({ read_at: new Date().toISOString() }).eq("id", notificationId);
  revalidatePath("/admin/notifications");
}

export async function rejectWithdrawal(notificationId: string) {
  const supabase = createSupabaseAdmin();
  const { data: req } = await supabase
    .from("withdrawal_requests")
    .select("id")
    .eq("notification_id", notificationId)
    .eq("status", "pending")
    .single();
  if (req) {
    await supabase
      .from("withdrawal_requests")
      .update({ status: "rejected", reviewed_at: new Date().toISOString() })
      .eq("id", req.id);
  }
  await supabase.from("notifications").update({ read_at: new Date().toISOString() }).eq("id", notificationId);
  revalidatePath("/admin/notifications");
}

/** For use as form action. */
export async function rejectWithdrawalNotification(id: string) {
  await rejectWithdrawal(id);
}
