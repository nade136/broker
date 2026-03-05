import type { Metadata } from "next";
import { getGlobalDepositConfig } from "../actions/deposit-methods";
import { getMinWithdrawal } from "../actions/site-settings";
import GlobalDepositMethods from "./GlobalDepositMethods";
import MinWithdrawalForm from "./MinWithdrawalForm";

export const metadata: Metadata = {
  title: "Settings",
};

export default async function AdminSettingsPage() {
  const [initialDepositConfig, initialMinWithdrawal] = await Promise.all([
    getGlobalDepositConfig(),
    getMinWithdrawal(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-[#141d22] dark:text-gray-100">
          Settings
        </h1>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Platform settings that affect the user dashboard and overall experience.
        </p>
      </div>

      <div className="space-y-4">
        <GlobalDepositMethods initialConfig={initialDepositConfig} />
        <div className="rounded-2xl bg-white p-5 shadow-sm dark:bg-slate-900">
          <h2 className="text-sm font-semibold text-[#141d22] dark:text-gray-100">
            User dashboard
          </h2>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Control what appears and is allowed in the user dashboard.
          </p>
          <ul className="mt-4 space-y-3 text-xs">
            <li className="flex items-center justify-between gap-4">
              <span className="text-gray-600 dark:text-gray-400">
                Allow new user registrations
              </span>
              <button
                type="button"
                className="h-6 w-11 rounded-full bg-amber-500 px-1 transition"
                aria-label="Toggle on"
              >
                <span className="block h-4 w-4 rounded-full bg-white shadow" />
              </button>
            </li>
            <li className="flex items-center justify-between gap-4">
              <span className="text-gray-600 dark:text-gray-400">
                Maintenance mode (hide dashboard from users)
              </span>
              <button
                type="button"
                className="h-6 w-11 rounded-full bg-gray-200 px-1 transition dark:bg-gray-700"
                aria-label="Toggle off"
              >
                <span className="block h-4 w-4 translate-x-0 rounded-full bg-white shadow" />
              </button>
            </li>
          </ul>
        </div>

        <MinWithdrawalForm initialValue={initialMinWithdrawal} />

        <p className="text-[11px] text-gray-500 dark:text-gray-400">
          Connect your backend to persist these settings. Changes here will affect what users see and can do in the user dashboard.
        </p>
      </div>
    </div>
  );
}
