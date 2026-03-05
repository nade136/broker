"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { submitWithdrawalRequest } from "./actions";

const METHOD_IDS = ["bank", "crypto", "paypal", "cashapp"] as const;
const METHOD_TITLES: Record<(typeof METHOD_IDS)[number], string> = {
  bank: "Bank",
  crypto: "Cryptocurrency",
  paypal: "Paypal",
  cashapp: "CashApp",
};

const PAYOUT_LABELS: Record<(typeof METHOD_IDS)[number], { label: string; placeholder: string }> = {
  bank: { label: "Your bank account details", placeholder: "e.g. Bank name, account number, routing" },
  crypto: { label: "Your wallet address", placeholder: "e.g. BTC or ETH address" },
  paypal: { label: "Your PayPal email", placeholder: "e.g. you@example.com" },
  cashapp: { label: "Your CashApp $tag", placeholder: "e.g. $YourTag" },
};

type WithdrawMethod = { id: (typeof METHOD_IDS)[number]; title: string };

export default function WithdrawForm() {
  const [minWithdrawal, setMinWithdrawal] = useState(0);
  const [methods, setMethods] = useState<WithdrawMethod[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [payoutDetails, setPayoutDetails] = useState("");
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const load = async () => {
      const { data: minData } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "min_withdrawal_usd")
        .maybeSingle();
      const val = minData?.value;
      setMinWithdrawal(Math.max(0, parseFloat(String(val ?? "0")) || 0));

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setMethods([]);
        return;
      }

      const { data: configRows, error: configErr } = await supabase
        .from("withdrawal_method_config")
        .select("scope, scope_id, method_id, enabled");
      if (configErr || !configRows?.length) {
        setMethods(METHOD_IDS.map((id) => ({ id, title: METHOD_TITLES[id] })));
      } else {
        const userRows = configRows.filter((r: { scope: string; scope_id: string }) => r.scope === "user" && r.scope_id === user.id);
        const globalRows = configRows.filter((r: { scope: string }) => r.scope === "global");
        const source = userRows.length > 0 ? userRows : globalRows;
        const enabledIds = METHOD_IDS.filter((methodId) => {
          const row = source.find((r: { method_id: string }) => r.method_id === methodId);
          return row ? (row as { enabled: boolean }).enabled : true;
        });
        setMethods(enabledIds.map((id) => ({ id, title: METHOD_TITLES[id] })));
      }

    };
    load();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const methodTitle = selectedMethod;
    if (!methodTitle || !payoutDetails.trim()) {
      setMessage("Please select a method and enter your payout details (bank account, wallet address, etc.).");
      setStatus("error");
      return;
    }
    if (!amount.trim()) {
      setMessage("Please enter an amount.");
      setStatus("error");
      return;
    }
    const numAmount = parseFloat(amount.trim());
    if (isNaN(numAmount) || numAmount < minWithdrawal) {
      setMessage(minWithdrawal > 0 ? `Minimum withdrawal is $${minWithdrawal.toFixed(2)}.` : "Please enter a valid amount.");
      setStatus("error");
      return;
    }

    setStatus("sending");
    setMessage("");

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setMessage("You must be logged in.");
        setStatus("error");
        return;
      }

      const profile = await supabase.from("profiles").select("full_name").eq("id", user.id).single();
      const userName = profile.data?.full_name ?? "";

      const result = await submitWithdrawalRequest(
        user.id,
        user.email ?? "",
        userName,
        methodTitle,
        amount.trim(),
        payoutDetails.trim()
      );

      if (result.ok) {
        setMessage(result.message);
        setStatus("done");
        setAmount("");
        setPayoutDetails("");
        setSelectedMethod(null);
      } else {
        setMessage(result.error);
        setStatus("error");
      }
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Something went wrong.");
      setStatus("error");
    }
  }

  const methodId = selectedMethod === "Bank" ? "bank" : selectedMethod === "Cryptocurrency" ? "crypto" : selectedMethod === "Paypal" ? "paypal" : "cashapp";
  const payoutLabel = methodId ? PAYOUT_LABELS[methodId as keyof typeof PAYOUT_LABELS] : null;

  return (
    <div className="rounded-2xl bg-white px-5 py-5 shadow-sm dark:bg-slate-900">
      <h1 className="mb-4 text-base font-semibold text-[#141d22] dark:text-gray-100">
        Select Withdrawal Method
      </h1>
      {methods.length === 0 ? (
        <p className="text-xs text-gray-500 dark:text-gray-400">
          No withdrawal methods enabled for your account. Contact support.
        </p>
      ) : (
        <>
          <div className="mb-6 space-y-3 text-xs">
            {methods.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => {
                  setSelectedMethod(m.title);
                  setPayoutDetails("");
                }}
                className={`flex w-full items-center justify-between rounded-xl border-2 px-4 py-3 text-left transition-colors ${
                  selectedMethod === m.title
                    ? "border-amber-500 bg-amber-50 dark:border-amber-500 dark:bg-amber-900/20"
                    : "border-transparent bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700"
                }`}
              >
                <div className="font-semibold">{m.title}</div>
                <span className="text-lg text-gray-400">→</span>
              </button>
            ))}
          </div>

          {selectedMethod && (
            <form onSubmit={handleSubmit} className="space-y-4 border-t border-gray-100 pt-6 dark:border-gray-800">
              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                Enter where you want to receive the funds. Admin will see this and approve or decline your request.
              </p>
              {payoutLabel && (
                <div>
                  <label className="mb-1 block text-[11px] font-medium text-gray-500 dark:text-gray-400">
                    {payoutLabel.label} *
                  </label>
                  <input
                    type="text"
                    value={payoutDetails}
                    onChange={(e) => setPayoutDetails(e.target.value)}
                    placeholder={payoutLabel.placeholder}
                    className="w-full max-w-md rounded-lg border border-gray-200 px-3 py-2 text-xs outline-none focus:border-amber-500 dark:border-gray-700 dark:bg-slate-800 dark:text-gray-100"
                    required
                  />
                </div>
              )}
              <div>
                <label className="mb-1 block text-[11px] font-medium text-gray-500 dark:text-gray-400">
                  Amount ($)
                </label>
                {minWithdrawal > 0 && (
                  <p className="mb-1 text-[11px] text-gray-500 dark:text-gray-400">
                    Minimum withdrawal: ${minWithdrawal.toFixed(2)}
                  </p>
                )}
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full max-w-xs rounded-lg border border-gray-200 px-3 py-2 text-xs outline-none focus:border-amber-500 dark:border-gray-700 dark:bg-slate-800 dark:text-gray-100"
                />
              </div>
              <button
                type="submit"
                disabled={status === "sending"}
                className="rounded-lg bg-amber-500 px-4 py-2 text-xs font-semibold text-white hover:bg-amber-600 disabled:opacity-50"
              >
                {status === "sending" ? "Sending…" : "Submit request"}
              </button>
              {message && (
                <p
                  className={`text-xs ${
                    status === "error" ? "text-red-600 dark:text-red-400" : "text-gray-600 dark:text-gray-300"
                  }`}
                >
                  {message}
                </p>
              )}
            </form>
          )}
        </>
      )}
    </div>
  );
}
