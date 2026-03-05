import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Transactions",
};

const tabs = ["All", "Deposits", "Withdrawals", "Transfers"];

export default function AdminTransactionsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-[#141d22] dark:text-gray-100">
          Transactions
        </h1>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          View all user transactions. This mirrors and controls what users see in their dashboard.
        </p>
      </div>

      <div className="rounded-2xl bg-white shadow-sm dark:bg-slate-900">
        <div className="flex flex-wrap gap-2 border-b border-gray-100 px-4 pt-4 pb-2 dark:border-gray-800">
          {tabs.map((tab, i) => (
            <button
              key={tab}
              type="button"
              className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                i === 0
                  ? "bg-amber-500 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-slate-800 dark:text-gray-300 dark:hover:bg-slate-700"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="flex h-48 items-center justify-center text-xs text-gray-400 dark:text-gray-500">
          No transactions. Connect your backend to list user transactions.
        </div>
      </div>
    </div>
  );
}
