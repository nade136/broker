import { NextResponse } from "next/server";

const COINGECKO_URL = "https://api.coingecko.com/api/v3/coins/markets";

export interface CryptoRow {
  symbol: string;
  name: string;
  price: number;
  changePercent: number;
  changeValue: number;
}

export async function GET() {
  try {
    const res = await fetch(
      `${COINGECKO_URL}?vs_currency=usd&per_page=100&page=1&sparkline=false`,
      { next: { revalidate: 60 } }
    );
    if (!res.ok) throw new Error("CoinGecko request failed");
    const data = await res.json();

    const toRow = (c: {
      symbol: string;
      name: string;
      current_price: number;
      price_change_percentage_24h: number | null;
      price_change_24h: number | null;
    }): CryptoRow => ({
      symbol: (c.symbol?.toUpperCase() ?? "") + "/USD",
      name: c.name ?? "",
      price: c.current_price ?? 0,
      changePercent: c.price_change_percentage_24h ?? 0,
      changeValue: c.price_change_24h ?? 0,
    });

    const sorted = [...data].filter(
      (c: { price_change_percentage_24h: number | null }) =>
        c.price_change_percentage_24h != null
    );

    const favourites = sorted
      .slice(0, 10)
      .map(toRow);

    const byGain = [...sorted].sort(
      (a: { price_change_percentage_24h: number }, b: { price_change_percentage_24h: number }) =>
        (b.price_change_percentage_24h ?? 0) - (a.price_change_percentage_24h ?? 0)
    );
    const gainers = byGain.slice(0, 10).map(toRow);

    const byLoss = [...sorted].sort(
      (a: { price_change_percentage_24h: number }, b: { price_change_percentage_24h: number }) =>
        (a.price_change_percentage_24h ?? 0) - (b.price_change_percentage_24h ?? 0)
    );
    const losers = byLoss.slice(0, 10).map(toRow);

    return NextResponse.json({ favourites, gainers, losers });
  } catch (e) {
    console.error("markets/crypto:", e);
    return NextResponse.json(
      { error: "Failed to fetch crypto data" },
      { status: 500 }
    );
  }
}
