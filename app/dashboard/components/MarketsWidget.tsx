"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

type TabId = "Favourites" | "Gainers" | "Losers" | "Forex" | "Stocks" | "Indices";

interface MarketRow {
  symbol: string;
  name: string;
  price: number;
  changePercent: number;
  changeValue: number;
}

const TABS: TabId[] = ["Favourites", "Gainers", "Losers", "Forex", "Stocks", "Indices"];

function formatPrice(price: number): string {
  if (price >= 1000) return price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (price >= 1) return price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 4 });
  if (price >= 0.0001) return price.toLocaleString("en-US", { minimumFractionDigits: 4, maximumFractionDigits: 4 });
  return price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 6 });
}

function formatChange(value: number): string {
  if (value == null || Number.isNaN(value)) return "—";
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}

export default function MarketsWidget() {
  const [activeTab, setActiveTab] = useState<TabId>("Favourites");
  const [crypto, setCrypto] = useState<{ favourites: MarketRow[]; gainers: MarketRow[]; losers: MarketRow[] } | null>(null);
  const [forex, setForex] = useState<MarketRow[] | null>(null);
  const [stocks, setStocks] = useState<MarketRow[]>([]);
  const [indices, setIndices] = useState<MarketRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCrypto = useCallback(async () => {
    const res = await fetch("/api/markets/crypto");
    if (!res.ok) throw new Error("Crypto fetch failed");
    const data = await res.json();
    setCrypto({ favourites: data.favourites ?? [], gainers: data.gainers ?? [], losers: data.losers ?? [] });
  }, []);

  const fetchForex = useCallback(async () => {
    const res = await fetch("/api/markets/forex");
    if (!res.ok) throw new Error("Forex fetch failed");
    const data = await res.json();
    setForex(Array.isArray(data) ? data : []);
  }, []);

  const fetchStocks = useCallback(async () => {
    const res = await fetch("/api/markets/stocks");
    const data = await res.json();
    setStocks(data.rows ?? []);
  }, []);

  const fetchIndices = useCallback(async () => {
    const res = await fetch("/api/markets/indices");
    const data = await res.json();
    setIndices(data.rows ?? []);
  }, []);

  useEffect(() => {
    setError(null);
    setLoading(true);
    Promise.all([fetchCrypto(), fetchForex(), fetchStocks(), fetchIndices()])
      .then(() => setLoading(false))
      .catch((e) => {
        setError(e?.message ?? "Failed to load markets");
        setLoading(false);
      });
  }, [fetchCrypto, fetchForex, fetchStocks, fetchIndices]);

  const rows: MarketRow[] = (() => {
    if (activeTab === "Favourites") return crypto?.favourites ?? [];
    if (activeTab === "Gainers") return crypto?.gainers ?? [];
    if (activeTab === "Losers") return crypto?.losers ?? [];
    if (activeTab === "Forex") return forex ?? [];
    if (activeTab === "Stocks") return stocks;
    if (activeTab === "Indices") return indices;
    return [];
  })();

  return (
    <section className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="border-b border-gray-100 px-4 py-3 dark:border-slate-800 sm:px-5">
        <div className="flex flex-wrap items-center gap-2">
          {TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                activeTab === tab
                  ? "bg-amber-500/15 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-slate-800 dark:hover:text-gray-200"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        {error && (
          <div className="px-4 py-6 text-center text-sm text-amber-600 dark:text-amber-400">
            {error}
          </div>
        )}
        {loading && !crypto && !forex && (
          <div className="animate-pulse px-4 py-4 sm:px-5">
            <div className="flex gap-4 border-b border-gray-100 py-3 dark:border-slate-800">
              <div className="h-4 w-24 rounded bg-gray-200 dark:bg-slate-700" />
              <div className="h-4 w-20 rounded bg-gray-200 dark:bg-slate-700" />
              <div className="h-4 w-16 rounded bg-gray-200 dark:bg-slate-700" />
            </div>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="flex gap-4 border-b border-gray-50 py-3 dark:border-slate-800/50">
                <div className="h-4 w-28 rounded bg-gray-100 dark:bg-slate-800" />
                <div className="h-4 w-20 rounded bg-gray-100 dark:bg-slate-800" />
                <div className="h-4 w-14 rounded bg-gray-100 dark:bg-slate-800" />
              </div>
            ))}
          </div>
        )}
        {!loading && !error && (
          <>
            <table className="w-full min-w-[480px] text-left text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:border-slate-800 dark:text-gray-400">
                  <th className="px-4 py-3 sm:px-5">Symbol</th>
                  <th className="px-4 py-3 sm:px-5 text-right">Last price</th>
                  <th className="px-4 py-3 sm:px-5 text-right">24h change</th>
                  <th className="w-20 px-4 py-3 sm:px-5 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-slate-800">
                {rows.length === 0 && !loading && (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                      No data for this tab.
                    </td>
                  </tr>
                )}
                {rows.map((row) => {
                  const isPositive = row.changePercent >= 0;
                  return (
                    <tr
                      key={`${activeTab}-${row.symbol}`}
                      className="group transition-colors hover:bg-gray-50/80 dark:hover:bg-slate-800/50"
                    >
                      <td className="px-4 py-3 sm:px-5">
                        <div>
                          <span className="font-semibold text-[#141d22] dark:text-gray-100">{row.symbol}</span>
                          <span className="ml-1 hidden text-gray-500 dark:text-gray-400 sm:inline">· {row.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 sm:px-5 text-right font-medium tabular-nums text-[#141d22] dark:text-gray-100">
                        {formatPrice(row.price)}
                      </td>
                      <td className="px-4 py-3 sm:px-5 text-right">
                        <span
                          className={`inline-flex items-center rounded px-1.5 py-0.5 font-medium tabular-nums ${
                            isPositive
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                              : "bg-red-500/10 text-red-600 dark:text-red-400"
                          }`}
                        >
                          {formatChange(row.changePercent)}
                        </span>
                      </td>
                      <td className="px-4 py-3 sm:px-5 text-right">
                        <Link
                          href="/dashboard/markets"
                          className="inline-flex items-center rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-amber-600 dark:bg-amber-500 dark:hover:bg-amber-600"
                        >
                          Trade
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </>
        )}
      </div>
    </section>
  );
}
