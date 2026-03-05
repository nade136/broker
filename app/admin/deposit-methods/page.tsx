import type { Metadata } from "next";
import Link from "next/link";
import { getGlobalDepositConfig } from "../actions/deposit-methods";
import GlobalDepositMethods from "../settings/GlobalDepositMethods";

export const metadata: Metadata = {
  title: "Deposit methods",
};

export default async function AdminDepositMethodsPage() {
  const initialDepositConfig = await getGlobalDepositConfig();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-[#141d22] dark:text-gray-100">
          Deposit methods
        </h1>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Choose which payment options appear on the user Deposit page for all users. You can override per user under Users → [user] → Payment & withdrawal.
        </p>
        <Link
          href="/admin/settings"
          className="mt-2 inline-block text-xs font-medium text-amber-600 hover:underline dark:text-amber-400"
        >
          ← All settings
        </Link>
      </div>

      <GlobalDepositMethods initialConfig={initialDepositConfig} />
    </div>
  );
}
