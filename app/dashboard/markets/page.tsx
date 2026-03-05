import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Markets",
};

export default function MarketsPage() {
  return (
    <div className="space-y-6 rounded-2xl bg-white px-5 py-5 shadow-sm dark:bg-slate-900">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <h1 className="text-base font-semibold text-[#141d22] dark:text-gray-100">
          Markets
        </h1>
        <input
          type="search"
          placeholder="Search for asset..."
          className="w-full max-w-xs rounded-full border border-gray-200 px-4 py-2 text-xs outline-none focus:border-teal-500 dark:border-gray-700 dark:bg-transparent dark:text-gray-100"
        />
      </div>
      <div className="flex flex-wrap gap-2 text-xs">
        {["Favourites", "Gainers", "Losers", "Stocks", "Forex", "Indices"].map(
          (tab, index) => (
            <button
              key={tab}
              type="button"
              className={`rounded-full px-3 py-1 ${
                index === 1
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
        Trading pairs table coming soon.
      </div>
    </div>
  );
}
