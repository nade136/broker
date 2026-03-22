import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Auto Trading",
};

const traders = [
  { name: "Dont folow Shady B", winRate: "90% win rate" },
  { name: "Crpto Bull", winRate: "49% win rate" },
  { name: "Tara Murphy", winRate: "96% win rate" },
  { name: "Amelia S. Mason", winRate: "93% win rate" },
  { name: "Meghan Lawrence", winRate: "94% win rate" },
];

export default function AutoTradingPage() {
  return (
    <div className="rounded-2xl bg-white px-5 py-5 shadow-sm dark:bg-slate-900">
      <h1 className="mb-4 text-base font-semibold text-[#141d22] dark:text-gray-100">
        Auto Trading
      </h1>
      <input
        type="search"
        placeholder="Search strategies..."
        className="mb-4 w-full rounded-full border border-gray-200 px-4 py-2 text-xs outline-none focus:border-teal-500 dark:border-gray-700 dark:bg-transparent dark:text-gray-100"
      />
      <ul className="space-y-2 text-xs">
        {traders.map((t) => (
          <li
            key={t.name}
            className="flex items-center justify-between rounded-xl bg-gray-100 px-3 py-2 hover:bg-gray-200 dark:bg-slate-800 dark:text-gray-100 dark:hover:bg-slate-700"
          >
            <div>
              <div className="font-semibold">{t.name}</div>
              <div className="text-[11px] text-gray-500 dark:text-gray-400">
                {t.winRate}
              </div>
            </div>
            <span className="text-xs text-gray-400">84% PS</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
