import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Withdraw",
};

const methods = ["Bank", "Cryptocurrency", "Paypal", "CashApp"];

export default function WithdrawPage() {
  return (
    <div className="rounded-2xl bg-white px-5 py-5 shadow-sm dark:bg-slate-900">
      <h1 className="mb-4 text-base font-semibold text-[#141d22] dark:text-gray-100">
        Select Withdrawal Method
      </h1>
      <div className="space-y-3 text-xs">
        {methods.map((m) => (
          <button
            key={m}
            type="button"
            className="flex w-full items-center justify-between rounded-xl bg-gray-100 px-4 py-3 text-left hover:bg-gray-200 dark:bg-slate-800 dark:text-gray-100 dark:hover:bg-slate-700"
          >
            <div>
              <div className="font-semibold">{m}</div>
            </div>
            <span className="text-lg text-gray-400">→</span>
          </button>
        ))}
      </div>
    </div>
  );
}

