"use client";

import { useState } from "react";
import { DEPOSIT_METHODS } from "@/lib/deposit-methods";
import { setGlobalDepositConfig, type DepositMethodConfigItem } from "../actions/deposit-methods";

export default function GlobalDepositMethods({
  initialConfig,
}: {
  initialConfig: DepositMethodConfigItem[];
}) {
  const [config, setConfig] = useState<DepositMethodConfigItem[]>(initialConfig);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const toggle = (method_id: string, enabled: boolean) => {
    setConfig((prev) => prev.map((c) => (c.method_id === method_id ? { ...c, enabled } : c)));
  };

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await setGlobalDepositConfig(config);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm dark:bg-slate-900">
      <h2 className="text-sm font-semibold text-[#141d22] dark:text-gray-100">
        Deposit methods (all users)
      </h2>
      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
        These options apply to every user’s Deposit page unless you set a custom list for a specific user.
      </p>
      <div className="mt-4 space-y-3">
        {DEPOSIT_METHODS.map((m) => {
          const c = config.find((x) => x.method_id === m.id);
          const enabled = c?.enabled ?? true;
          return (
            <div
              key={m.id}
              className="flex flex-col gap-2 rounded-xl border border-gray-200 p-3 dark:border-gray-700 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <div className="font-medium text-[#141d22] dark:text-gray-100">{m.title}</div>
                <div className="text-[11px] text-gray-500 dark:text-gray-400">{m.subtitle}</div>
              </div>
              <label className="flex items-center gap-2 text-xs">
                <input
                  type="checkbox"
                  checked={enabled}
                  onChange={(e) => toggle(m.id, e.target.checked)}
                  className="rounded border-gray-300 text-amber-500 focus:ring-amber-500"
                />
                Shown on Deposit page
              </label>
            </div>
          );
        })}
      </div>
      <button
        type="button"
        onClick={handleSave}
        disabled={saving}
        className="mt-4 rounded-lg bg-amber-500 px-4 py-2 text-xs font-semibold text-white hover:bg-amber-600 disabled:opacity-50"
      >
        {saving ? "Saving…" : saved ? "Saved" : "Save for all users"}
      </button>
    </div>
  );
}
