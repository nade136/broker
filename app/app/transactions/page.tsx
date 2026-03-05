import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Transactions",
};

export default function TransactionsPage() {
  const tabs = ["All Transactions", "Deposit", "Withdraw", "Transfer", "More"];

  return (
    <div className="rounded-2xl bg-white px-5 py-5 shadow-sm dark:bg-slate-900">
      <h1 className="mb-4 text-base font-semibold text-[#141d22] dark:text-gray-100">
        Transactions
      </h1>
      <div className="mb-4 flex flex-wrap gap-4 border-b border-gray-100 pb-2 text-xs dark:border-gray-800">
        {tabs.map((tab, index) => (
          <button
            key={tab}
            type="button"
            className={`pb-1 ${
              index === 0
                ? "border-b-2 border-yellow-400 font-semibold text-yellow-500"
                : "text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
      <div className="flex h-40 items-center justify-center text-xs text-gray-400 dark:text-gray-500">
        No transactions yet.
      </div>
    </div>
  );
}

