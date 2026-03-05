import { NextResponse } from "next/server";

const BASE = "https://api.frankfurter.app";

const PAIRS = [
  { symbol: "EUR/USD", from: "USD", to: "EUR", name: "Euro / US Dollar", invert: true },
  { symbol: "GBP/USD", from: "USD", to: "GBP", name: "British Pound / US Dollar", invert: true },
  { symbol: "USD/JPY", from: "USD", to: "JPY", name: "US Dollar / Japanese Yen", invert: false },
  { symbol: "USD/CHF", from: "USD", to: "CHF", name: "US Dollar / Swiss Franc", invert: false },
  { symbol: "AUD/USD", from: "USD", to: "AUD", name: "Australian Dollar / US Dollar", invert: true },
] as const;

export interface ForexRow {
  symbol: string;
  name: string;
  price: number;
  changePercent: number;
  changeValue: number;
}

function getYesterday(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

export async function GET() {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const yesterday = getYesterday();

    const [latestRes, prevRes] = await Promise.all([
      fetch(`${BASE}/latest?from=USD&to=EUR,GBP,JPY,CHF,AUD`, { next: { revalidate: 300 } }),
      fetch(`${BASE}/${yesterday}..${today}?from=USD&to=EUR,GBP,JPY,CHF,AUD`, { next: { revalidate: 300 } }),
    ]);

    if (!latestRes.ok) throw new Error("Frankfurter latest failed");
    const latest = await latestRes.json();
    let prevRates: Record<string, number> = {};
    if (prevRes.ok) {
      const prevData = await prevRes.json();
      const ratesByDate = prevData.rates;
      if (ratesByDate && typeof ratesByDate === "object") {
        const dates = Object.keys(ratesByDate).sort();
        const lastDate = dates[dates.length - 1];
        if (lastDate) prevRates = ratesByDate[lastDate] ?? {};
      }
    }

    const rates = latest.rates || {};
    const rows: ForexRow[] = PAIRS.map((p) => {
      const rate = rates[p.to];
      let price: number;
      if (p.invert && rate != null) price = 1 / rate;
      else if (rate != null) price = rate;
      else price = 0;

      const prev = prevRates[p.to];
      let changePercent = 0;
      let changeValue = 0;
      if (prev != null && rate != null && prev > 0) {
        const prevPrice = p.invert ? 1 / prev : prev;
        changeValue = price - prevPrice;
        changePercent = (changeValue / prevPrice) * 100;
      }

      return {
        symbol: p.symbol,
        name: p.name,
        price,
        changePercent,
        changeValue,
      };
    });

    return NextResponse.json(rows);
  } catch (e) {
    console.error("markets/forex:", e);
    return NextResponse.json(
      { error: "Failed to fetch forex data" },
      { status: 500 }
    );
  }
}
