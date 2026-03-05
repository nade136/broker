import type { Metadata } from "next";
import PlaceholderPage from "../components/PlaceholderPage";

export const metadata: Metadata = {
  title: "Crypto Trading",
  description: "Trade Bitcoin, Ethereum, Litecoin and more with Web.",
};

export default function Page() {
  return <PlaceholderPage title="Crypto Trading" description="Trade top cryptocurrencies with high liquidity and 24/7 market access." />;
}
