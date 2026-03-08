import type { Metadata } from "next";
import MarketsWidget from "./components/MarketsWidget";
import BalanceCards from "./BalanceCards";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-[#141d22] dark:text-gray-100 sm:text-2xl">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Overview of your accounts and markets
        </p>
      </div>

      <div>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
          Account summary
        </h2>
        <BalanceCards />
      </div>

      <div>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
          Markets
        </h2>
        <MarketsWidget />
      </div>
    </div>
  );
}


