import type { Metadata } from "next";
import PlaceholderPage from "../components/PlaceholderPage";

export const metadata: Metadata = {
  title: "Forex Trading",
  description: "Trade forex with Web. Major, minor, and exotic pairs with tight spreads and fast execution.",
};

export default function Page() {
  return <PlaceholderPage title="Forex Trading" description="Trade major, minor, and exotic currency pairs with competitive spreads and high leverage." />;
}
