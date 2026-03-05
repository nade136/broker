import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Plans",
};

export default function PlansPage() {
  const plans = [
    {
      title: "Trading Plans",
      description: "Want to get started earning from trades. Check it out.",
    },
    {
      title: "Mining Plans",
      description:
        "Leverage on our technology and hardware to earn passively.",
    },
  ];

  return (
    <div className="rounded-2xl bg-white px-5 py-5 shadow-sm dark:bg-slate-900">
      <h1 className="mb-4 text-base font-semibold text-[#141d22] dark:text-gray-100">
        Select a plan
      </h1>
      <p className="mb-6 text-xs text-gray-500 dark:text-gray-400">
        We have a variety of plan options to suit our vast majority of clients.
      </p>
      <div className="space-y-3">
        {plans.map((plan) => (
          <button
            key={plan.title}
            type="button"
            className="flex w-full items-center justify-between rounded-xl bg-gray-100 px-4 py-3 text-left text-xs hover:bg-gray-200 dark:bg-slate-800 dark:text-gray-100 dark:hover:bg-slate-700"
          >
            <div>
              <div className="font-semibold">{plan.title}</div>
              <div className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">
                {plan.description}
              </div>
            </div>
            <span className="text-lg text-gray-400">→</span>
          </button>
        ))}
      </div>
    </div>
  );
}

