"use client";

import { useState } from "react";
import { getMinWithdrawal, setMinWithdrawal } from "../actions/site-settings";

export default function MinWithdrawalForm({ initialValue }: { initialValue: string }) {
  const [value, setValue] = useState(initialValue);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await setMinWithdrawal(value);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm dark:bg-slate-900">
      <h2 className="text-sm font-semibold text-[#141d22] dark:text-gray-100">
        Withdrawals
      </h2>
      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
        Minimum amount and methods shown to users on their Withdraw page.
      </p>
      <div className="mt-4 flex flex-wrap items-end gap-4">
        <div>
          <label className="block text-[11px] font-medium text-gray-500 dark:text-gray-400">
            Min withdrawal (USD)
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            placeholder="0"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="mt-1 w-32 rounded-lg border border-gray-200 px-3 py-2 text-xs outline-none focus:border-amber-500 dark:border-gray-700 dark:bg-slate-800 dark:text-gray-100"
          />
        </div>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="rounded-lg bg-amber-500 px-4 py-2 text-xs font-semibold text-white hover:bg-amber-600 disabled:opacity-50"
        >
          {saving ? "Saving…" : saved ? "Saved" : "Save"}
        </button>
      </div>
    </div>
  );
}
