import type { Metadata } from "next";
import WithdrawForm from "./WithdrawForm";

export const metadata: Metadata = {
  title: "Withdraw",
};

export default function WithdrawPage() {
  return (
    <div className="space-y-6">
      <WithdrawForm />
      <p className="text-[11px] text-gray-500 dark:text-gray-400">
        Your request will be sent to the admin and appear in their Notifications. You will be notified once it is processed.
      </p>
    </div>
  );
}
