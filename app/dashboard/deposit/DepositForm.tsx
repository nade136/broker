"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { submitDepositProof } from "./actions";

type WalletOption = { id: string; coin: string; address: string };
type OtherOption = { id: string; method_id: string; detail: string };
const METHOD_LABELS: Record<string, string> = { bank: "Bank", paypal: "Paypal", cashapp: "CashApp" };

export default function DepositForm() {
  const searchParams = useSearchParams();
  const planId = searchParams.get("plan");
  const [planTitle, setPlanTitle] = useState<string | null>(null);
  const [planDepositAmount, setPlanDepositAmount] = useState<number>(0);
  const [depositEnabled, setDepositEnabled] = useState(true);
  const [clickedDeposit, setClickedDeposit] = useState(false);
  const [wallets, setWallets] = useState<WalletOption[]>([]);
  const [otherOptions, setOtherOptions] = useState<Record<string, OtherOption[]>>({ bank: [], paypal: [], cashapp: [] });
  const [selectedWalletId, setSelectedWalletId] = useState<string | null>(null);
  const [selectedOtherKey, setSelectedOtherKey] = useState<string | null>(null); // "methodId::optionId"
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "uploading" | "sending" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!planId) return;
    const load = async () => {
      const { data } = await supabase.from("plans").select("title, deposit_amount").eq("id", planId).maybeSingle();
      setPlanTitle(data?.title ?? null);
      setPlanDepositAmount(Number((data as { deposit_amount?: number })?.deposit_amount) || 0);
    };
    load();
  }, [planId]);

  useEffect(() => {
    const load = async () => {
      const { data: configData, error: configError } = await supabase
        .from("deposit_method_config")
        .select("scope, method_id, enabled");
      let enabled = true;
      if (!configError && configData?.length) {
        const userRows = configData.filter((r: { scope: string }) => r.scope === "user");
        const globalRows = configData.filter((r: { scope: string }) => r.scope === "global");
        const source = userRows.length > 0 ? userRows : globalRows;
        enabled = source.some(
          (r: { method_id: string; enabled: boolean }) => r.method_id === "crypto" && r.enabled
        );
      }
      setDepositEnabled(enabled);

      const { data: addrData, error: addrError } = await supabase
        .from("user_crypto_addresses")
        .select("id, coin, address")
        .order("created_at", { ascending: true });
      if (!addrError && addrData?.length) {
        setWallets(addrData as WalletOption[]);
        if (addrData.length === 1) setSelectedWalletId(addrData[0].id);
      } else {
        setWallets([]);
      }

      const { data: optData } = await supabase
        .from("user_withdrawal_options")
        .select("id, method_id, detail")
        .order("created_at", { ascending: true });
      const opts: Record<string, OtherOption[]> = { bank: [], paypal: [], cashapp: [] };
      if (optData?.length) {
        for (const r of optData as { id: string; method_id: string; detail: string }[]) {
          if (r.method_id in opts) opts[r.method_id].push({ id: r.id, method_id: r.method_id, detail: r.detail });
        }
      }
      setOtherOptions(opts);
    };
    load();
  }, []);

  function copyAddress(address: string) {
    navigator.clipboard.writeText(address).then(() => {
      setMessage("Address copied to clipboard.");
      setTimeout(() => setMessage(""), 2000);
    });
  }

  function getMethodLabel(): string {
    if (selectedWalletId) {
      const w = wallets.find((w) => w.id === selectedWalletId);
      return w ? `Deposit (${w.coin})` : "Deposit";
    }
    if (selectedOtherKey) {
      const [methodId, optionId] = selectedOtherKey.split("::");
      const list = otherOptions[methodId ?? ""] ?? [];
      const o = list.find((x) => x.id === optionId);
      const label = METHOD_LABELS[methodId ?? ""] ?? methodId ?? "Other";
      return o ? `Deposit (${label} - ${o.detail})` : "Deposit";
    }
    return "Deposit";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) {
      setMessage("Please upload a screenshot of your payment.");
      setStatus("error");
      return;
    }
    const methodLabel = getMethodLabel();
    const amountToSubmit = planDepositAmount > 0 ? String(planDepositAmount) : "—";

    setStatus("uploading");
    setMessage("");

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setMessage("You must be logged in.");
        setStatus("error");
        return;
      }

      const ext = file.name.split(".").pop() || "png";
      const path = `${user.id}/${Date.now()}-proof.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("deposit-screenshots")
        .upload(path, file, { upsert: false });

      if (uploadError) {
        const msg = uploadError.message ?? "";
        const isBucketMissing = msg.toLowerCase().includes("bucket") || msg.toLowerCase().includes("not found");
        const isRls = msg.toLowerCase().includes("row-level security") || msg.toLowerCase().includes("policy");
        let display = uploadError.message || "Upload failed.";
        if (isBucketMissing)
          display = "Storage bucket missing. Run: node --env-file=.env.local scripts/create-deposit-bucket.mjs then add the upload policy (see README).";
        else if (isRls)
          display = "Upload blocked by storage policy. In Supabase Dashboard → Storage → deposit-screenshots → Policies, add a policy: INSERT for authenticated (or run supabase/storage-policy-deposit-screenshots.sql in SQL Editor).";
        setMessage(display);
        setStatus("error");
        return;
      }

      const { data: urlData } = supabase.storage
        .from("deposit-screenshots")
        .getPublicUrl(path);
      const screenshotUrl = urlData.publicUrl;

      setStatus("sending");
      const profile = await supabase.from("profiles").select("full_name").eq("id", user.id).single();
      const userName = profile.data?.full_name ?? "";

      const result = await submitDepositProof(
        user.id,
        user.email ?? "",
        userName,
        methodLabel,
        amountToSubmit,
        screenshotUrl,
        planId
      );

      if (result.ok) {
        setMessage(result.message);
        setStatus("done");
        setFile(null);
        setSelectedWalletId(wallets.length === 1 ? wallets[0].id : null);
        setSelectedOtherKey(null);
      } else {
        setMessage(result.error);
        setStatus("error");
      }
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Something went wrong.");
      setStatus("error");
    }
  }

  return (
    <div className="rounded-2xl bg-white px-5 py-5 shadow-sm dark:bg-slate-900">
      {planTitle && (
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-900/50 dark:bg-amber-900/20">
          <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
            Deposit to activate your <strong>{planTitle}</strong> plan.
            {planDepositAmount > 0 && (
              <span className="mt-1 block">
                Deposit amount: <strong>${planDepositAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}</strong>. Pay this amount, then upload proof below.
              </span>
            )}
            {planDepositAmount <= 0 && <span className="mt-1 block">Upload proof below and admin will confirm.</span>}
          </p>
        </div>
      )}
      <h1 className="mb-4 text-base font-semibold text-[#141d22] dark:text-gray-100">
        Select Payment Method
      </h1>
      {!depositEnabled ? (
        <p className="mb-6 text-xs text-gray-500 dark:text-gray-400">
          No deposit methods are enabled for your account. Contact support if you need to make a deposit.
        </p>
      ) : !clickedDeposit ? (
        <div className="mb-6">
          <button
            type="button"
            onClick={() => setClickedDeposit(true)}
            className="flex w-full items-center justify-between rounded-xl border-2 border-transparent bg-gray-100 px-4 py-3 text-left transition-colors hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700"
          >
            <div>
              <div className="font-semibold text-[#141d22] dark:text-gray-100">Deposit</div>
              <div className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">
                Upload proof after payment. Admin will confirm.
              </div>
            </div>
            <span className="text-lg text-gray-400">→</span>
          </button>
        </div>
      ) : (
        <>
          <h2 className="mb-3 text-sm font-medium text-[#141d22] dark:text-gray-100">
            Payment options
          </h2>
          {wallets.length === 0 && otherOptions.bank.length === 0 && otherOptions.paypal.length === 0 && otherOptions.cashapp.length === 0 ? (
            <p className="mb-6 text-xs text-gray-500 dark:text-gray-400">
              Payment options are set by the admin for your account. None have been added yet. Ask the admin to add wallet addresses or bank/PayPal/CashApp options in Admin → Users → your account → Payment & withdrawal, then you will see them here.
            </p>
          ) : (
            <div className="mb-6 space-y-3 text-xs">
              {wallets.map((w) => (
                <div
                  key={w.id}
                  className={`rounded-xl border-2 px-4 py-3 ${
                    selectedWalletId === w.id && !selectedOtherKey
                      ? "border-amber-500 bg-amber-50 dark:border-amber-500 dark:bg-amber-900/20"
                      : "border-transparent bg-gray-100 dark:bg-slate-800"
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="font-semibold text-[#141d22] dark:text-gray-100">{w.coin}</div>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="payment-option"
                        checked={selectedWalletId === w.id && !selectedOtherKey}
                        onChange={() => {
                          setSelectedWalletId(w.id);
                          setSelectedOtherKey(null);
                        }}
                        className="rounded border-gray-300 text-amber-500"
                      />
                      <span className="text-[11px]">I paid to this</span>
                    </label>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <code className="min-w-0 flex-1 truncate rounded bg-white/80 px-2 py-1.5 text-[11px] dark:bg-slate-900/80">
                      {w.address}
                    </code>
                    <button
                      type="button"
                      onClick={() => copyAddress(w.address)}
                      className="shrink-0 rounded-lg bg-amber-500 px-3 py-1.5 text-[11px] font-medium text-white hover:bg-amber-600"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              ))}
              {(["bank", "paypal", "cashapp"] as const).map((methodId) =>
                (otherOptions[methodId] ?? []).map((o) => {
                  const key = `${methodId}::${o.id}`;
                  const isSelected = selectedOtherKey === key;
                  return (
                    <div
                      key={key}
                      className={`rounded-xl border-2 px-4 py-3 ${
                        isSelected
                          ? "border-amber-500 bg-amber-50 dark:border-amber-500 dark:bg-amber-900/20"
                          : "border-transparent bg-gray-100 dark:bg-slate-800"
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="font-semibold text-[#141d22] dark:text-gray-100">
                          {METHOD_LABELS[methodId]} — {o.detail}
                        </div>
                        <label className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="payment-option"
                            checked={isSelected}
                            onChange={() => {
                              setSelectedWalletId(null);
                              setSelectedOtherKey(key);
                            }}
                            className="rounded border-gray-300 text-amber-500"
                          />
                          <span className="text-[11px]">I paid to this</span>
                        </label>
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <code className="min-w-0 flex-1 truncate rounded bg-white/80 px-2 py-1.5 text-[11px] dark:bg-slate-900/80">
                          {o.detail}
                        </code>
                        <button
                          type="button"
                          onClick={() => copyAddress(o.detail)}
                          className="shrink-0 rounded-lg bg-amber-500 px-3 py-1.5 text-[11px] font-medium text-white hover:bg-amber-600"
                        >
                          Copy
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </>
      )}

      {depositEnabled && clickedDeposit && (
        <form onSubmit={handleSubmit} className="space-y-4 border-t border-gray-100 pt-6 dark:border-gray-800">
          <div>
            <label className="mb-1 block text-[11px] font-medium text-gray-500 dark:text-gray-400">
              Upload payment screenshot
            </label>
            <input
              type="file"
              accept="image/*,.pdf"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="block w-full max-w-md text-xs text-gray-500 file:mr-3 file:rounded-lg file:border-0 file:bg-amber-500 file:px-4 file:py-2 file:text-xs file:font-semibold file:text-white file:hover:bg-amber-600"
            />
          </div>
          <button
            type="submit"
            disabled={status === "uploading" || status === "sending" || !file}
            className="rounded-lg bg-amber-500 px-4 py-2 text-xs font-semibold text-white hover:bg-amber-600 disabled:opacity-50"
          >
            {status === "uploading"
              ? "Uploading…"
              : status === "sending"
                ? "Sending to admin…"
                : "Send to admin"}
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
    </div>
  );
}
