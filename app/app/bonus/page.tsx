import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bonus",
};

export default function BonusPage() {
  return (
    <div className="rounded-2xl bg-white px-5 py-5 text-center shadow-sm dark:bg-slate-900">
      <h1 className="text-base font-semibold text-[#141d22] dark:text-gray-100">
        My Bonus
      </h1>
      <p className="mt-6 text-xs text-gray-500 dark:text-gray-400">
        You don&apos;t have any active bonuses yet.
      </p>
    </div>
  );
}

