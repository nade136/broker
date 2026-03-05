import type { Metadata } from "next";
import MarketsWidget from "./components/MarketsWidget";
import BalanceCards from "./BalanceCards";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <BalanceCards />
      <MarketsWidget />
    </div>
  );
}


