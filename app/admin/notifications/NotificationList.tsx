"use client";

import { formatDateTimeUtc } from "@/lib/format-date";
import {
  markNotificationRead,
  acceptDeposit,
  rejectDepositNotification,
  submitAcceptWithdrawalForm,
  rejectWithdrawalNotification,
  submitNewSignupDecision,
  deleteNotification,
} from "./actions";

const TYPE_LABELS: Record<string, string> = {
  new_signup: "New signup",
  login: "Login",
  withdrawal_request: "Withdrawal request",
  deposit_proof: "Deposit proof",
  maturity_pending: "Maturity pending",
};

type NotificationRow = {
  id: string;
  type: string;
  user_id: string | null;
  title: string;
  message: string | null;
  metadata: Record<string, unknown>;
  read_at: string | null;
  created_at: string;
  profiles?: { full_name: string | null; email: string } | null;
};

export default function NotificationList({
  notifications,
}: {
  notifications: NotificationRow[];
}) {
  return (
    <div className="space-y-3">
      {notifications.length === 0 ? (
        <p className="rounded-xl border border-dashed border-gray-200 py-8 text-center text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
          No notifications yet.
        </p>
      ) : (
        notifications.map((n) => (
          <div
            key={n.id}
            className={`rounded-xl border p-4 dark:border-gray-700 ${
              n.read_at
                ? "border-gray-200 bg-gray-50/50 dark:bg-slate-900/50"
                : "border-amber-200 bg-amber-50/30 dark:border-amber-900/50 dark:bg-amber-900/10"
            }`}
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[11px] font-medium text-amber-700 dark:text-amber-300">
                    {TYPE_LABELS[n.type] ?? n.type}
                  </span>
                  <span className="text-[11px] text-gray-500 dark:text-gray-400">
                    {formatDateTimeUtc(n.created_at)}
                  </span>
                </div>
                <h3 className="mt-1 font-semibold text-[#141d22] dark:text-gray-100">
                  {n.title}
                </h3>
                {n.message && (
                  <p className="mt-1 text-xs text-gray-600 dark:text-gray-300">
                    {n.message}
                  </p>
                )}
                {n.profiles && (
                  <p className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">
                    From: {n.profiles.full_name || n.profiles.email || n.user_id}
                  </p>
                )}
                {n.type === "deposit_proof" && n.metadata && (
                  <div className="mt-2 space-y-1 text-xs">
                    {n.metadata.payment_method != null && (
                      <p>
                        Method:{" "}
                        <span className="font-medium">
                          {String(n.metadata.payment_method as string)}
                        </span>
                      </p>
                    )}
                    {n.metadata.amount != null && (
                      <p>
                        Amount:{" "}
                        <span className="font-medium">
                          ${String(n.metadata.amount as string | number)}
                        </span>
                      </p>
                    )}
                    {n.metadata.screenshot_path != null && (
                      <a
                        href={String(n.metadata.screenshot_path as string)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-amber-600 hover:underline dark:text-amber-400"
                      >
                        View payment screenshot →
                      </a>
                    )}
                  </div>
                )}
                {n.type === "withdrawal_request" && n.metadata && (
                  <div className="mt-2 space-y-1 text-xs">
                    {n.metadata.method != null && (
                      <p>Method: <span className="font-medium">{String(n.metadata.method as string)}</span></p>
                    )}
                    {n.metadata.amount != null && (
                      <p>Amount: <span className="font-medium">${String(n.metadata.amount as string | number)}</span></p>
                    )}
                    {n.metadata.payout_details != null && (
                      <p className="mt-1">
                        <span className="text-gray-500 dark:text-gray-400">Payout details (where to send):</span>{" "}
                        <span className="font-medium text-[#141d22] dark:text-gray-100">{String(n.metadata.payout_details as string)}</span>
                      </p>
                    )}
                  </div>
                )}
              </div>
              <div className="flex shrink-0 flex-wrap items-center gap-2">
                {!n.read_at && (
                  <>
                    {n.type === "deposit_proof" && (
                      <>
                        <form action={acceptDeposit.bind(null, n.id)} className="inline">
                          <button
                            type="submit"
                            className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700"
                          >
                            Accept
                          </button>
                        </form>
                        <form action={rejectDepositNotification.bind(null, n.id)} className="inline">
                          <button
                            type="submit"
                            className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700"
                          >
                            Decline
                          </button>
                        </form>
                      </>
                    )}
                    {n.type === "withdrawal_request" && (
                      <div className="flex w-full max-w-md flex-col items-end gap-2">
                        <form action={submitAcceptWithdrawalForm} className="flex w-full flex-col items-stretch gap-2 rounded-lg border border-gray-200 bg-gray-50/80 p-2 dark:border-gray-700 dark:bg-slate-800/50">
                          <input type="hidden" name="notificationId" value={n.id} />
                          <label className="flex cursor-pointer items-start gap-2 text-left text-[11px] text-gray-600 dark:text-gray-400">
                            <input
                              type="checkbox"
                              name="forceWithoutBalance"
                              className="mt-0.5 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                            />
                            <span>
                              Approve without debiting balance (use if you paid the user outside the platform, or
                              balances do not match this request).
                            </span>
                          </label>
                          <button
                            type="submit"
                            className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700"
                          >
                            Approve
                          </button>
                        </form>
                        <form action={rejectWithdrawalNotification.bind(null, n.id)} className="inline self-end">
                          <button
                            type="submit"
                            className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700"
                          >
                            Decline
                          </button>
                        </form>
                      </div>
                    )}
                    {n.type === "new_signup" && (
                      <form
                        action={submitNewSignupDecision}
                        className="flex w-full max-w-sm flex-col gap-2 sm:items-end"
                      >
                        <input type="hidden" name="notificationId" value={n.id} />
                        <div className="w-full">
                          <label
                            htmlFor={`signup-email-msg-${n.id}`}
                            className="mb-1 block text-[11px] font-medium text-gray-600 dark:text-gray-400"
                          >
                            Message to user (optional, sent by email)
                          </label>
                          <textarea
                            id={`signup-email-msg-${n.id}`}
                            name="emailMessage"
                            rows={3}
                            maxLength={2000}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs text-[#141d22] placeholder-gray-400 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 dark:border-gray-700 dark:bg-slate-900 dark:text-gray-100 dark:placeholder-gray-500"
                            placeholder="Add a note included in the approval or decline email…"
                          />
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="submit"
                            name="decision"
                            value="accept"
                            className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700"
                          >
                            Accept
                          </button>
                          <button
                            type="submit"
                            name="decision"
                            value="reject"
                            className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700"
                          >
                            Decline
                          </button>
                        </div>
                      </form>
                    )}
                    <form action={markNotificationRead.bind(null, n.id)} className="inline">
                      <button
                        type="submit"
                        className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
                      >
                        Mark read
                      </button>
                    </form>
                  </>
                )}
                <form action={deleteNotification.bind(null, n.id)} className="inline">
                  <button
                    type="submit"
                    className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-900/20"
                  >
                    Clear
                  </button>
                </form>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
