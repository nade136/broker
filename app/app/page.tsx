import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {["Spot Account", "Profit Account", "Initial Deposit", "Mining Account"].map(
          (label) => (
            <div
              key={label}
              className="flex flex-col justify-between rounded-2xl bg-white px-5 py-4 shadow-sm dark:bg-slate-900"
            >
              <div className="text-xs font-semibold text-gray-500">
                {label}
              </div>
              <div className="mt-4 text-xs text-gray-400">Available Balance</div>
              <div className="mt-1 text-xl font-semibold text-[#141d22] dark:text-gray-100">
                $0.00
              </div>
            </div>
          ),
        )}
      </section>

      <section className="rounded-2xl bg-white px-5 py-4 shadow-sm dark:bg-slate-900">
        <div className="mb-4 flex flex-wrap items-center gap-3 text-xs">
          {["Favourites", "Gainers", "Losers", "Forex", "Stocks", "Indices"].map(
            (tab, index) => (
              <button
                key={tab}
                type="button"
                className={`rounded-full px-3 py-1 ${
                  index === 0
                    ? "bg-yellow-400 text-black"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-slate-800 dark:text-gray-200 dark:hover:bg-slate-700"
                }`}
              >
                {tab}
              </button>
            ),
          )}
        </div>
        <div className="flex h-40 items-center justify-center text-xs text-gray-400 dark:text-gray-500">
          Trading pairs will appear here.
        </div>
      </section>
    </div>
  );
}

