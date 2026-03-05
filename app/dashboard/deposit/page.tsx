import type { Metadata } from "next";
import { Suspense } from "react";
import DepositForm from "./DepositForm";

export const metadata: Metadata = {
  title: "Deposit",
};

function DepositFormFallback() {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-slate-900">
      <p className="text-sm text-gray-500 dark:text-gray-400">Loading deposit form…</p>
    </div>
  );
}

export default function DepositPage() {
  return (
    <div className="space-y-6">
      <Suspense fallback={<DepositFormFallback />}>
        <DepositForm />
      </Suspense>
      <p className="text-[11px] text-gray-500 dark:text-gray-400">
        After you make a payment, upload a screenshot and click &quot;Send to admin&quot;. The admin will be notified by email and can review it in Notifications.
      </p>
    </div>
  );
}
