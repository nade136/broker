import { NextResponse } from "next/server";
import YahooFinance from "yahoo-finance2";

// ETFs as proxies for major indices (live data via Yahoo Finance)
const INDEX_SYMBOLS = ["SPY", "QQQ", "DIA", "IWM", "EFA"];
const INDEX_NAMES: Record<string, string> = {
  SPY: "S&P 500",
  QQQ: "Nasdaq 100",
  DIA: "Dow Jones 30",
  IWM: "Russell 2000",
  EFA: "MSCI EAFE",
};

export interface IndexRow {
  symbol: string;
  name: string;
  price: number;
  changePercent: number;
  changeValue: number;
}

export async function GET() {
  const token = process.env.FINNHUB_API_KEY;

  if (token) {
    try {
      const rows: IndexRow[] = [];
      for (const symbol of INDEX_SYMBOLS) {
        const res = await fetch(
          `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(symbol)}&token=${token}`,
          { next: { revalidate: 60 } }
        );
        if (!res.ok) continue;
        const q = await res.json();
        if (q.c == null) continue;
        rows.push({
          symbol,
          name: INDEX_NAMES[symbol] ?? symbol,
          price: q.c,
          changePercent: q.dp ?? 0,
          changeValue: q.d ?? 0,
        });
      }
      return NextResponse.json({ rows });
    } catch (e) {
      console.error("markets/indices (finnhub):", e);
    }
  }

  try {
    const yahooFinance = new YahooFinance();
    const quotes = await yahooFinance.quote(INDEX_SYMBOLS);
    const results = Array.isArray(quotes) ? quotes : [quotes];
    const rows: IndexRow[] = results
      .filter(
        (q): q is NonNullable<typeof q> =>
          q != null &&
          typeof (q as { regularMarketPrice?: number }).regularMarketPrice === "number"
      )
      .map((q) => {
        const qq = q as {
          symbol: string;
          regularMarketPrice: number;
          regularMarketChangePercent?: number;
          regularMarketChange?: number;
          longName?: string;
          shortName?: string;
        };
        const price = qq.regularMarketPrice;
        const changePercent = qq.regularMarketChangePercent ?? 0;
        const changeValue = qq.regularMarketChange ?? (price * changePercent) / 100;
        return {
          symbol: qq.symbol,
          name: qq.longName ?? qq.shortName ?? INDEX_NAMES[qq.symbol] ?? qq.symbol,
          price,
          changePercent,
          changeValue,
        };
      });
    return NextResponse.json({ rows });
  } catch (e) {
    console.error("markets/indices:", e);
    return NextResponse.json({ rows: [], error: "Failed to fetch indices" }, { status: 500 });
  }
}
