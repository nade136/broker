import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Buy Coin",
};

const providers = ["Binance", "Coinbase", "CashApp", "Crypto.com", "Bitcoin.com"];

export default function BuyCoinPage() {
  return (
    <div className="rounded-2xl bg-white px-5 py-5 shadow-sm dark:bg-slate-900">
      <h1 className="text-base font-semibold text-[#141d22] dark:text-gray-100">
        Buy Coins
      </h1>
      <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
        You can buy bitcoin, ethereum, and other crypto currencies for account
        funding from third parties.
      </p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        {providers.map((p) => (
          <div
            key={p}
            className="flex h-20 items-center justify-center rounded-2xl bg-gray-100 text-xs font-semibold text-gray-700 dark:bg-slate-800 dark:text-gray-100"
          >
            {p}
          </div>
        ))}
      </div>
    </div>
  );
}
