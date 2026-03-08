import type { Metadata } from "next";
import VerificationForm from "./VerificationForm";
import VerificationStatusBanner from "./VerificationStatusBanner";

export const metadata: Metadata = {
  title: "Verification",
};

export default function VerificationPage() {
  return (
    <div className="space-y-6">
      <VerificationStatusBanner />
      <div>
        <h1 className="text-xl font-semibold text-[#141d22] dark:text-gray-100 sm:text-2xl">
          Verification
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Submit your ID for account verification
        </p>
      </div>
      <VerificationForm />
    </div>
  );
}
