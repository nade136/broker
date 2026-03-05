"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { DEPOSIT_METHODS } from "@/lib/deposit-methods";
import { setUserDepositConfig, type DepositMethodConfigItem } from "@/app/admin/actions/deposit-methods";
import { ACCOUNT_TYPES, LABELS } from "./constants";
import { useRouter } from "next/navigation";
import {
  updateAdminProfile,
  updateAdminBalances,
  getAdminUserMessages,
  sendAdminMessage,
  markAdminUserMessagesRead,
  clearAdminUserMessages,
  setCryptoAddressesForUser,
  setWithdrawalConfigForUser,
  setWithdrawalOptionsForUser,
  clearTransferHistoryForUser,
  type AdminUserMessage,
  type CryptoAddressRow,
  type WithdrawalOptionRow,
} from "./actions";

type CryptoAddress = { id: string; coin: string; address: string };

const WITHDRAW_METHODS = [
  { id: "bank", title: "Bank" },
  { id: "crypto", title: "Cryptocurrency" },
  { id: "paypal", title: "Paypal" },
  { id: "cashapp", title: "CashApp" },
] as const;
type WithdrawMethodId = (typeof WITHDRAW_METHODS)[number]["id"];

type InitialProfile = {
  firstname: string;
  lastname: string;
  email: string;
  address: string;
  status: string;
};
type InitialBalances = Record<(typeof ACCOUNT_TYPES)[number], string>;

type InitialDepositConfig = { useGlobal: boolean; methods: DepositMethodConfigItem[] };
type InitialWithdrawalConfig = { methods: { method_id: string; enabled: boolean }[] };

function groupOptionsByMethod(options: WithdrawalOptionRow[]): Record<WithdrawMethodId, { id: string; detail: string }[]> {
  const out: Record<string, { id: string; detail: string }[]> = { bank: [], paypal: [], cashapp: [] };
  for (const o of options) {
    if (o.method_id in out) out[o.method_id as WithdrawMethodId].push({ id: o.id, detail: o.detail });
  }
  return out as Record<WithdrawMethodId, { id: string; detail: string }[]>;
}

export default function AdminUserDetailClient({
  userId,
  initialProfile,
  initialBalances,
  initialMessages,
  initialTransferHistory,
  initialDepositConfig,
  initialCryptoAddresses,
  initialWithdrawalConfig,
  initialWithdrawalOptions,
}: {
  userId: string;
  initialProfile: InitialProfile;
  initialBalances: InitialBalances;
  initialMessages: AdminUserMessage[];
  initialTransferHistory: { id: string; type: string; amount: number; status: string; note: string | null; created_at: string }[];
  initialDepositConfig: InitialDepositConfig;
  initialCryptoAddresses: CryptoAddressRow[];
  initialWithdrawalConfig: InitialWithdrawalConfig;
  initialWithdrawalOptions: WithdrawalOptionRow[];
}) {
  const [profile, setProfile] = useState(initialProfile);
  const [balances, setBalances] = useState(initialBalances);
  const [messages, setMessages] = useState<AdminUserMessage[]>(initialMessages);
  const transferHistory = initialTransferHistory;
  const [messageBody, setMessageBody] = useState("");
  const [messageSending, setMessageSending] = useState(false);
  const [useGlobalDeposit, setUseGlobalDeposit] = useState(initialDepositConfig.useGlobal);
  const [depositMethods, setDepositMethods] = useState<DepositMethodConfigItem[]>(initialDepositConfig.methods);
  const [paymentSaving, setPaymentSaving] = useState(false);
  const [withdrawMethods, setWithdrawMethods] = useState(() =>
    WITHDRAW_METHODS.map((m) => ({
      id: m.id,
      title: m.title,
      enabled: initialWithdrawalConfig.methods.find((c) => c.method_id === m.id)?.enabled ?? true,
    }))
  );
  const [withdrawalOptions, setWithdrawalOptions] = useState<Record<WithdrawMethodId, { id: string; detail: string }[]>>(
    () => groupOptionsByMethod(initialWithdrawalOptions)
  );
  const [cryptoAddresses, setCryptoAddresses] = useState<CryptoAddress[]>(
    initialCryptoAddresses.map((r) => ({ id: r.id, coin: r.coin, address: r.address }))
  );
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [clearingMessages, setClearingMessages] = useState(false);
  const [clearingHistory, setClearingHistory] = useState(false);
  const router = useRouter();

  useEffect(() => {
    markAdminUserMessagesRead(userId).catch(() => {});
  }, [userId]);

  const addCryptoAddress = () => {
    setCryptoAddresses((prev) => [...prev, { id: `ca-${Date.now()}`, coin: "", address: "" }]);
  };
  const updateCryptoAddress = (idx: number, field: "coin" | "address", value: string) => {
    setCryptoAddresses((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: value };
      return next;
    });
  };
  const removeCryptoAddress = (idx: number) => {
    setCryptoAddresses((prev) => prev.filter((_, i) => i !== idx));
  };

  const addWithdrawalOption = (methodId: WithdrawMethodId) => {
    if (methodId === "crypto") return;
    setWithdrawalOptions((prev) => ({
      ...prev,
      [methodId]: [...(prev[methodId] ?? []), { id: `opt-${Date.now()}`, detail: "" }],
    }));
  };
  const updateWithdrawalOption = (methodId: WithdrawMethodId, idx: number, detail: string) => {
    setWithdrawalOptions((prev) => {
      const list = [...(prev[methodId] ?? [])];
      list[idx] = { ...list[idx], detail };
      return { ...prev, [methodId]: list };
    });
  };
  const removeWithdrawalOption = (methodId: WithdrawMethodId, idx: number) => {
    setWithdrawalOptions((prev) => ({
      ...prev,
      [methodId]: (prev[methodId] ?? []).filter((_, i) => i !== idx),
    }));
  };

  const handleSaveProfile = async () => {
    setError("");
    try {
      await updateAdminProfile(userId, profile);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save");
    }
  };

  const handleSaveBalances = async () => {
    setError("");
    try {
      await updateAdminBalances(userId, balances);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save balances");
    }
  };

  const handleSavePaymentMethods = async () => {
    setPaymentSaving(true);
    setError("");
    try {
      await setUserDepositConfig(userId, useGlobalDeposit, useGlobalDeposit ? undefined : depositMethods);
      await setCryptoAddressesForUser(
        userId,
        cryptoAddresses.map((c) => ({ coin: c.coin, address: c.address }))
      );
      await setWithdrawalConfigForUser(
        userId,
        withdrawMethods.map((m) => ({ method_id: m.id, enabled: m.enabled }))
      );
      const allOptions: { method_id: string; detail: string }[] = [];
      for (const methodId of ["bank", "paypal", "cashapp"] as const) {
        for (const o of withdrawalOptions[methodId] ?? []) {
          if (o.detail.trim()) allOptions.push({ method_id: methodId, detail: o.detail.trim() });
        }
      }
      await setWithdrawalOptionsForUser(userId, allOptions);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save deposit methods");
    } finally {
      setPaymentSaving(false);
    }
  };

  const handleSendMessage = async () => {
    if (!messageBody.trim()) return;
    setMessageSending(true);
    setError("");
    try {
      await sendAdminMessage(userId, messageBody);
      const updated = await getAdminUserMessages(userId);
      setMessages(updated);
      setMessageBody("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to send message");
    } finally {
      setMessageSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link href="/admin/users" className="text-xs font-medium text-amber-600 hover:underline dark:text-amber-400">
            ← Back to users
          </Link>
          <h1 className="mt-2 text-lg font-semibold text-[#141d22] dark:text-gray-100">User account</h1>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Everything for this user. Changes here reflect on the user dashboard.
          </p>
        </div>
        <Link
          href="/dashboard"
          className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-600 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
        >
          View as user dashboard →
        </Link>
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-slate-900">
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Status:</span>
        <select
          value={profile.status}
          onChange={(e) => setProfile((p) => ({ ...p, status: e.target.value }))}
          className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-medium outline-none focus:border-amber-500 dark:border-gray-700 dark:bg-slate-800 dark:text-gray-100"
        >
          <option value="Active">Active</option>
          <option value="Suspended">Suspended</option>
          <option value="Deleted">Deleted</option>
        </select>
        <span
          className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium ${
            profile.status === "Active"
              ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
              : profile.status === "Suspended"
                ? "bg-amber-500/20 text-amber-600 dark:text-amber-400"
                : "bg-red-500/20 text-red-600 dark:text-red-400"
          }`}
        >
          {profile.status}
        </span>
        <button
          type="button"
          onClick={handleSaveProfile}
          className="rounded-lg bg-amber-500 px-3 py-2 text-xs font-semibold text-white hover:bg-amber-600"
        >
          Save status
        </button>
      </div>

      <div className="rounded-2xl bg-white p-5 shadow-sm dark:bg-slate-900">
        <h2 className="mb-4 text-base font-semibold text-[#141d22] dark:text-gray-100">My Info</h2>
        <p className="mb-4 text-xs text-gray-500 dark:text-gray-400">
          Profile shown on user dashboard → Account.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-[11px] font-medium text-gray-500 dark:text-gray-400">Firstname</label>
            <input
              type="text"
              value={profile.firstname}
              onChange={(e) => setProfile((p) => ({ ...p, firstname: e.target.value }))}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs outline-none focus:border-amber-500 dark:border-gray-700 dark:bg-slate-800 dark:text-gray-100"
            />
          </div>
          <div>
            <label className="mb-1 block text-[11px] font-medium text-gray-500 dark:text-gray-400">Lastname</label>
            <input
              type="text"
              value={profile.lastname}
              onChange={(e) => setProfile((p) => ({ ...p, lastname: e.target.value }))}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs outline-none focus:border-amber-500 dark:border-gray-700 dark:bg-slate-800 dark:text-gray-100"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-[11px] font-medium text-gray-500 dark:text-gray-400">Email</label>
            <input
              type="email"
              value={profile.email}
              onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs outline-none focus:border-amber-500 dark:border-gray-700 dark:bg-slate-800 dark:text-gray-100"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-[11px] font-medium text-gray-500 dark:text-gray-400">Address</label>
            <input
              type="text"
              value={profile.address}
              onChange={(e) => setProfile((p) => ({ ...p, address: e.target.value }))}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs outline-none focus:border-amber-500 dark:border-gray-700 dark:bg-slate-800 dark:text-gray-100"
            />
          </div>
          <div>
            <label className="mb-1 block text-[11px] font-medium text-gray-500 dark:text-gray-400">Status</label>
            <select
              value={profile.status}
              onChange={(e) => setProfile((p) => ({ ...p, status: e.target.value }))}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs outline-none focus:border-amber-500 dark:border-gray-700 dark:bg-slate-800 dark:text-gray-100"
            >
              <option value="Active">Active</option>
              <option value="Suspended">Suspended</option>
              <option value="Deleted">Deleted</option>
            </select>
          </div>
        </div>
        <button
          type="button"
          onClick={handleSaveProfile}
          className="mt-4 rounded-lg bg-amber-500 px-4 py-2 text-xs font-semibold text-white hover:bg-amber-600"
        >
          {saved ? "Saved" : "Save profile"}
        </button>
      </div>

      <div className="rounded-2xl bg-white p-5 shadow-sm dark:bg-slate-900">
        <h2 className="mb-4 text-base font-semibold text-[#141d22] dark:text-gray-100">Account balances</h2>
        <p className="mb-4 text-xs text-gray-500 dark:text-gray-400">
          Spot Account, Profit Account, Initial Deposit, Mining Account (user dashboard home).
        </p>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {ACCOUNT_TYPES.map((key) => (
            <div key={key} className="rounded-xl bg-gray-50 p-4 dark:bg-slate-800">
              <div className="text-[11px] font-medium text-gray-500 dark:text-gray-400">{LABELS[key]}</div>
              <div className="mt-2 flex items-center gap-1">
                <span className="text-xs text-gray-400">$</span>
                <input
                  type="text"
                  value={balances[key]}
                  onChange={(e) => setBalances((b) => ({ ...b, [key]: e.target.value }))}
                  className="w-20 rounded border border-gray-200 bg-white px-2 py-1 text-sm font-semibold outline-none focus:border-amber-500 dark:border-gray-700 dark:bg-slate-900 dark:text-gray-100"
                />
              </div>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={handleSaveBalances}
          className="mt-4 rounded-lg border border-gray-200 px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
        >
          Update balances
        </button>
      </div>

      <div className="rounded-2xl bg-white p-5 shadow-sm dark:bg-slate-900">
        <h2 className="mb-4 text-base font-semibold text-[#141d22] dark:text-gray-100">Payment & withdrawal</h2>
        <p className="mb-4 text-xs text-gray-500 dark:text-gray-400">
          Deposit and withdrawal methods shown on the user dashboard. Enable/disable and add details.
        </p>
        <div className="mb-6">
          <h3 className="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">Deposit methods (user dashboard → Deposit)</h3>
          <p className="mb-3 text-[11px] text-gray-500 dark:text-gray-400">
            Apply to all users (Settings) or set custom for this user only.
          </p>
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:gap-6">
            <label className="flex items-center gap-2 text-xs">
              <input
                type="radio"
                name="depositScope"
                checked={useGlobalDeposit}
                onChange={() => setUseGlobalDeposit(true)}
                className="border-gray-300 text-amber-500 focus:ring-amber-500"
              />
              Use global default (same for all users)
            </label>
            <label className="flex items-center gap-2 text-xs">
              <input
                type="radio"
                name="depositScope"
                checked={!useGlobalDeposit}
                onChange={() => setUseGlobalDeposit(false)}
                className="border-gray-300 text-amber-500 focus:ring-amber-500"
              />
              Use custom for this user only
            </label>
          </div>
          <div className="space-y-3">
            {DEPOSIT_METHODS.map((m) => {
              const cfg = depositMethods.find((c) => c.method_id === m.id);
              const enabled = cfg?.enabled ?? true;
              return (
                <div key={m.id} className="flex flex-col gap-2 rounded-xl border border-gray-200 p-3 dark:border-gray-700 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="font-medium text-[#141d22] dark:text-gray-100">{m.title}</div>
                    <div className="text-[11px] text-gray-500 dark:text-gray-400">{m.subtitle}</div>
                  </div>
                  <label className="flex items-center gap-2 text-xs">
                    <input
                      type="checkbox"
                      checked={enabled}
                      disabled={useGlobalDeposit}
                      onChange={(e) =>
                        setDepositMethods((prev) =>
                          prev.map((c) => (c.method_id === m.id ? { ...c, enabled: e.target.checked } : c))
                        )
                      }
                      className="rounded border-gray-300 text-amber-500 focus:ring-amber-500 disabled:opacity-60"
                    />
                    Shown on Deposit page
                  </label>
                </div>
              );
            })}
          </div>
          <div className="mt-4 rounded-xl border border-gray-200 p-4 dark:border-gray-700">
            <h4 className="mb-3 text-xs font-semibold text-[#141d22] dark:text-gray-100">Crypto addresses (multiple)</h4>
            <p className="mb-3 text-[11px] text-gray-500 dark:text-gray-400">
              Add wallet addresses per coin/network. User sees these when depositing crypto.
            </p>
            <div className="space-y-3">
              {cryptoAddresses.map((c, idx) => (
                <div key={c.id} className="flex flex-col gap-2 rounded-lg bg-gray-50 p-3 dark:bg-slate-800/50 sm:flex-row sm:items-center sm:gap-3">
                  <input
                    type="text"
                    placeholder="Wallet name (e.g. BTC, ETH)"
                    value={c.coin}
                    onChange={(e) => updateCryptoAddress(idx, "coin", e.target.value)}
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs dark:border-gray-700 dark:bg-slate-800 dark:text-gray-100 sm:w-44"
                  />
                  <input
                    type="text"
                    placeholder="Wallet address"
                    value={c.address}
                    onChange={(e) => updateCryptoAddress(idx, "address", e.target.value)}
                    className="min-w-0 flex-1 rounded-lg border border-gray-200 px-3 py-2 text-xs dark:border-gray-700 dark:bg-slate-800 dark:text-gray-100"
                  />
                  <button type="button" onClick={() => removeCryptoAddress(idx)} className="shrink-0 rounded-lg border border-red-200 px-2 py-1.5 text-[11px] font-medium text-red-600 hover:bg-red-50 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-900/20">
                    Remove
                  </button>
                </div>
              ))}
            </div>
            <button type="button" onClick={addCryptoAddress} className="mt-3 flex items-center gap-2 rounded-lg border border-dashed border-gray-300 px-3 py-2 text-xs font-medium text-gray-600 hover:border-amber-500 hover:text-amber-600 dark:border-gray-600 dark:text-gray-400">
              <span className="text-base">+</span> Add crypto address
            </button>
          </div>
        </div>
        <div>
          <h3 className="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">Withdrawal methods (user dashboard → Withdraw)</h3>
          <p className="mb-3 text-[11px] text-gray-500 dark:text-gray-400">
            Only enabled methods show on the user Withdraw page. Add multiple options (e.g. bank accounts) like crypto addresses.
          </p>
          <div className="space-y-4">
            {withdrawMethods.map((m) => (
              <div key={m.id} className="rounded-xl border border-gray-200 p-3 dark:border-gray-700">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="font-medium text-[#141d22] dark:text-gray-100">{m.title}</div>
                  <label className="flex items-center gap-2 text-xs">
                    <input
                      type="checkbox"
                      checked={m.enabled}
                      onChange={(e) => setWithdrawMethods((prev) => prev.map((x) => (x.id === m.id ? { ...x, enabled: e.target.checked } : x)))}
                      className="rounded border-gray-300 text-amber-500 focus:ring-amber-500"
                    />
                    Enabled
                  </label>
                </div>
                {m.id === "crypto" ? (
                  <p className="mt-2 text-[11px] text-gray-500 dark:text-gray-400">Uses crypto addresses above for withdrawal options.</p>
                ) : (
                  <div className="mt-3 space-y-2">
                    {(withdrawalOptions[m.id as WithdrawMethodId] ?? []).map((opt, idx) => (
                      <div key={opt.id} className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                        <input
                          type="text"
                          placeholder={m.id === "bank" ? "e.g. Chase checking" : m.id === "paypal" ? "PayPal email" : "CashApp $tag"}
                          value={opt.detail}
                          onChange={(e) => updateWithdrawalOption(m.id as WithdrawMethodId, idx, e.target.value)}
                          className="min-w-0 flex-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs outline-none focus:border-amber-500 dark:border-gray-700 dark:bg-slate-800 dark:text-gray-100"
                        />
                        <button type="button" onClick={() => removeWithdrawalOption(m.id as WithdrawMethodId, idx)} className="shrink-0 rounded-lg border border-red-200 px-2 py-1.5 text-[11px] font-medium text-red-600 hover:bg-red-50 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-900/20">
                          Remove
                        </button>
                      </div>
                    ))}
                    <button type="button" onClick={() => addWithdrawalOption(m.id as WithdrawMethodId)} className="mt-1 flex items-center gap-2 rounded-lg border border-dashed border-gray-300 px-3 py-2 text-[11px] font-medium text-gray-600 hover:border-amber-500 hover:text-amber-600 dark:border-gray-600 dark:text-gray-400">
                      <span className="text-base">+</span> Add {m.title.toLowerCase()} option
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        <button
          type="button"
          onClick={handleSavePaymentMethods}
          disabled={paymentSaving}
          className="mt-4 rounded-lg bg-amber-500 px-4 py-2 text-xs font-semibold text-white hover:bg-amber-600 disabled:opacity-50"
        >
          {paymentSaving ? "Saving…" : saved ? "Saved" : "Update deposit methods"}
        </button>
      </div>

      <div className="rounded-2xl bg-white p-5 shadow-sm dark:bg-slate-900">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-semibold text-[#141d22] dark:text-gray-100">Messages</h2>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Send a message to this user. They can read and reply from Dashboard → Messages.
            </p>
          </div>
          {messages.length > 0 && (
            <button
              type="button"
              disabled={clearingMessages}
              onClick={async () => {
                if (!confirm("Clear all messages for this user?")) return;
                setClearingMessages(true);
                setError("");
                try {
                  await clearAdminUserMessages(userId);
                  setMessages([]);
                } catch (e) {
                  setError(e instanceof Error ? e.message : "Failed to clear messages");
                } finally {
                  setClearingMessages(false);
                }
              }}
              className="shrink-0 rounded-lg border border-red-200 px-3 py-1.5 text-[11px] font-medium text-red-600 hover:bg-red-50 disabled:opacity-50 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-900/20"
            >
              {clearingMessages ? "Clearing…" : "Clear messages"}
            </button>
          )}
        </div>
        <div className="mb-4 max-h-64 space-y-3 overflow-y-auto rounded-lg border border-gray-200 bg-gray-50/50 p-3 dark:border-gray-700 dark:bg-slate-800/50">
          {messages.length === 0 ? (
            <p className="py-4 text-center text-xs text-gray-500 dark:text-gray-400">No messages yet. Send one below.</p>
          ) : (
            messages.map((m) => (
              <div
                key={m.id}
                className={`rounded-lg px-3 py-2 text-xs ${
                  m.from_admin
                    ? "ml-4 bg-amber-500/15 text-[#141d22] dark:text-gray-100"
                    : "mr-4 bg-gray-200 text-[#141d22] dark:bg-slate-700 dark:text-gray-200"
                }`}
              >
                <span className="font-medium">{m.from_admin ? "You" : "User"}</span>
                <span className="ml-2 text-gray-500 dark:text-gray-400">
                  {new Date(m.created_at).toLocaleString()}
                </span>
                <p className="mt-1 whitespace-pre-wrap">{m.body}</p>
              </div>
            ))
          )}
        </div>
        <div className="flex gap-2">
          <textarea
            value={messageBody}
            onChange={(e) => setMessageBody(e.target.value)}
            placeholder="Type a message..."
            rows={2}
            className="min-w-0 flex-1 rounded-lg border border-gray-200 px-3 py-2 text-xs outline-none focus:border-amber-500 dark:border-gray-700 dark:bg-slate-800 dark:text-gray-100"
          />
          <button
            type="button"
            onClick={handleSendMessage}
            disabled={messageSending || !messageBody.trim()}
            className="shrink-0 rounded-lg bg-amber-500 px-4 py-2 text-xs font-semibold text-white hover:bg-amber-600 disabled:opacity-50"
          >
            {messageSending ? "Sending…" : "Send"}
          </button>
        </div>
      </div>

      <div className="rounded-2xl bg-white p-5 shadow-sm dark:bg-slate-900">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-semibold text-[#141d22] dark:text-gray-100">Transfer history</h2>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Deposits (when you accept proof), withdrawals, and credits. Same as user dashboard → Transactions.</p>
          </div>
          {transferHistory.length > 0 && (
            <button
              type="button"
              disabled={clearingHistory}
              onClick={async () => {
                if (!confirm("Clear all transaction history for this user? Balances will not be changed.")) return;
                setClearingHistory(true);
                setError("");
                try {
                  await clearTransferHistoryForUser(userId);
                  router.refresh();
                } catch (e) {
                  setError(e instanceof Error ? e.message : "Failed to clear history");
                } finally {
                  setClearingHistory(false);
                }
              }}
              className="shrink-0 rounded-lg border border-red-200 px-3 py-1.5 text-[11px] font-medium text-red-600 hover:bg-red-50 disabled:opacity-50 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-900/20"
            >
              {clearingHistory ? "Clearing…" : "Clear history"}
            </button>
          )}
        </div>
        {transferHistory.length === 0 ? (
          <div className="mt-4 flex h-24 items-center justify-center rounded-lg border border-dashed border-gray-200 text-xs text-gray-400 dark:border-gray-700 dark:text-gray-500">
            No transactions yet
          </div>
        ) : (
          <div className="mt-4 space-y-2">
            {transferHistory.map((r) => (
              <div
                key={r.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-gray-100 px-3 py-2 dark:border-gray-800"
              >
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium dark:bg-slate-700">{r.type}</span>
                <span className="text-xs font-medium">${Number(r.amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                {r.note && <span className="text-[11px] text-gray-500 dark:text-gray-400">{r.note}</span>}
                <span className="text-[11px] text-gray-500 dark:text-gray-400">{new Date(r.created_at).toLocaleString()}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
