import { NextResponse } from "next/server";
import YahooFinance from "yahoo-finance2";

const STOCK_SYMBOLS = [
  "AAPL",
  "MSFT",
  "NVDA",
  "GOOGL",
  "AMZN",
  "TSLA",
  "META",
  "JPM",
];

const STOCK_NAMES: Record<string, string> = {
  AAPL: "Apple Inc.",
  MSFT: "Microsoft Corp.",
  NVDA: "NVIDIA Corp.",
  GOOGL: "Alphabet Inc.",
  AMZN: "Amazon.com Inc.",
  TSLA: "Tesla Inc.",
  META: "Meta Platforms Inc.",
  JPM: "JPMorgan Chase & Co.",
};

export interface StockRow {
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
      const rows: StockRow[] = [];
      for (const symbol of STOCK_SYMBOLS) {
        const res = await fetch(
          `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(symbol)}&token=${token}`,
          { next: { revalidate: 60 } }
        );
        if (!res.ok) continue;
        const q = await res.json();
        if (q.c == null) continue;
        rows.push({
          symbol,
          name: STOCK_NAMES[symbol] ?? symbol,
          price: q.c,
          changePercent: q.dp ?? 0,
          changeValue: q.d ?? 0,
        });
      }
      return NextResponse.json({ rows });
    } catch (e) {
      console.error("markets/stocks (finnhub):", e);
    }
  }

  try {
    const yahooFinance = new YahooFinance();
    const quotes = await yahooFinance.quote(STOCK_SYMBOLS);
    const results = Array.isArray(quotes) ? quotes : [quotes];
    const rows: StockRow[] = results
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
          name: qq.longName ?? qq.shortName ?? STOCK_NAMES[qq.symbol] ?? qq.symbol,
          price,
          changePercent,
          changeValue,
        };
      });
    return NextResponse.json({ rows });
  } catch (e) {
    console.error("markets/stocks:", e);
    return NextResponse.json({ rows: [], error: "Failed to fetch stocks" }, { status: 500 });
  }
}
