import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Withdrawals",
};

export default function AdminWithdrawalsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-[#141d22] dark:text-gray-100">
          Withdrawals
        </h1>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Approve or reject user withdrawal requests. Users see status updates in their dashboard.
        </p>
      </div>

      <div className="rounded-2xl bg-white p-5 shadow-sm dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3 dark:border-gray-800">
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
            Pending
          </span>
          <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[11px] font-medium text-amber-600 dark:text-amber-400">
            0 pending
          </span>
        </div>
        <div className="flex h-40 items-center justify-center text-xs text-gray-400 dark:text-gray-500">
          No pending withdrawals. When users submit a withdrawal from their dashboard, it will appear here for approval.
        </div>
      </div>

      <div className="rounded-2xl bg-white p-5 shadow-sm dark:bg-slate-900">
        <h2 className="text-sm font-semibold text-[#141d22] dark:text-gray-100">
          Recent (all statuses)
        </h2>
        <div className="mt-3 flex h-24 items-center justify-center text-xs text-gray-400 dark:text-gray-500">
          No withdrawal history yet.
        </div>
      </div>
    </div>
  );
}
