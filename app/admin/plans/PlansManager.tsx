"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createPlan, updatePlan, togglePlanVisibility, deletePlan, type PlanInput, type PlanType } from "./actions";

type PlanRow = {
  id: string;
  type: string;
  title: string;
  description: string | null;
  visible: boolean;
  profit_percentage: number;
  minimum_profit: number;
  term_days: number;
  deposit_amount: number;
};

const defaultPlan: PlanInput = {
  type: "trading",
  title: "",
  description: "",
  visible: true,
  profit_percentage: 0,
  minimum_profit: 0,
  term_days: 30,
  deposit_amount: 0,
};

export default function PlansManager({ plans }: { plans: PlanRow[] }) {
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<PlanInput>(defaultPlan);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  function startAdd() {
    setEditingId(null);
    setForm(defaultPlan);
    setAdding(true);
    setError("");
  }

  function startEdit(plan: PlanRow) {
    setAdding(false);
    setForm({
      type: (plan.type as PlanType) || "trading",
      title: plan.title,
      description: plan.description ?? "",
      visible: plan.visible,
      profit_percentage: plan.profit_percentage ?? 0,
      minimum_profit: plan.minimum_profit ?? 0,
      term_days: plan.term_days ?? 30,
      deposit_amount: plan.deposit_amount ?? 0,
    });
    setEditingId(plan.id);
    setError("");
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await createPlan(form);
      setForm(defaultPlan);
      setAdding(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create plan");
    } finally {
      setBusy(false);
    }
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!editingId) return;
    setError("");
    setBusy(true);
    try {
      await updatePlan(editingId, form);
      setEditingId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update plan");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className="flex flex-col gap-3 rounded-2xl bg-white p-5 shadow-sm dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between"
          >
            {editingId === plan.id ? (
              <form onSubmit={handleUpdate} className="flex w-full flex-col gap-3">
                <PlanFormFields form={form} setForm={setForm} />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={busy}
                    className="rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-amber-600 disabled:opacity-50"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingId(null)}
                    className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium dark:border-gray-700"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <>
                <div>
                  <div className="font-semibold text-[#141d22] dark:text-gray-100">
                    {plan.title}
                  </div>
                  <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {plan.description || "—"}
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-[11px] ${
                        plan.visible
                          ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                          : "bg-gray-200 text-gray-600 dark:bg-gray-600 dark:text-gray-300"
                      }`}
                    >
                      {plan.visible ? "Visible on user dashboard" : "Hidden"}
                    </span>
                    <span className="text-[11px] text-gray-400">
                      {plan.profit_percentage}% · min ${plan.minimum_profit} · {plan.term_days} days
                      {plan.deposit_amount != null && Number(plan.deposit_amount) > 0 && (
                        <> · Deposit ${Number(plan.deposit_amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}</>
                      )}
                    </span>
                  </div>
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => startEdit(plan)}
                    className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
                  >
                    Edit
                  </button>
                  <form action={togglePlanVisibility.bind(null, plan.id)} className="inline">
                    <button
                      type="submit"
                      className="rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-amber-600"
                    >
                      Toggle visibility
                    </button>
                  </form>
                  <button
                    type="button"
                    disabled={deletingId === plan.id}
                    onClick={async () => {
                      if (!confirm(`Delete plan "${plan.title}"? Users who selected this plan may be affected.`)) return;
                      setDeletingId(plan.id);
                      setError("");
                      try {
                        await deletePlan(plan.id);
                        if (editingId === plan.id) setEditingId(null);
                        router.refresh();
                      } catch (err) {
                        setError(err instanceof Error ? err.message : "Failed to delete plan");
                      } finally {
                        setDeletingId(null);
                      }
                    }}
                    className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-900/20"
                  >
                    {deletingId === plan.id ? "Deleting…" : "Delete"}
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </p>
      )}

      {adding ? (
        <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-slate-900">
          <form onSubmit={handleCreate} className="flex flex-col gap-4">
            <h3 className="text-sm font-semibold">New plan</h3>
            <PlanFormFields form={form} setForm={setForm} />
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={busy}
                className="rounded-lg bg-amber-500 px-4 py-2 text-xs font-semibold text-white hover:bg-amber-600 disabled:opacity-50"
              >
                Create plan
              </button>
              <button
                type="button"
                onClick={() => setAdding(false)}
                className="rounded-lg border border-gray-200 px-4 py-2 text-xs font-medium dark:border-gray-700"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/50 p-6 text-center dark:border-gray-700 dark:bg-slate-900/50">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Add new plan (Trading or Mining) to show on user dashboard.
          </p>
          <button
            type="button"
            onClick={startAdd}
            className="mt-3 rounded-lg bg-amber-500 px-4 py-2 text-xs font-semibold text-white hover:bg-amber-600"
          >
            + Add plan
          </button>
        </div>
      )}
    </div>
  );
}

function PlanFormFields({
  form,
  setForm,
}: {
  form: PlanInput;
  setForm: (f: PlanInput | ((prev: PlanInput) => PlanInput)) => void;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div>
        <label className="mb-1 block text-[11px] font-medium text-gray-500 dark:text-gray-400">
          Type
        </label>
        <select
          value={form.type}
          onChange={(e) => setForm((p) => ({ ...p, type: e.target.value as PlanType }))}
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs dark:border-gray-700 dark:bg-slate-800 dark:text-gray-100"
        >
          <option value="trading">Trading</option>
          <option value="mining">Mining</option>
        </select>
      </div>
      <div>
        <label className="mb-1 block text-[11px] font-medium text-gray-500 dark:text-gray-400">
          Title
        </label>
        <input
          type="text"
          value={form.title}
          onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
          placeholder="e.g. Trading Plans"
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs dark:border-gray-700 dark:bg-slate-800 dark:text-gray-100"
          required
        />
      </div>
      <div className="sm:col-span-2">
        <label className="mb-1 block text-[11px] font-medium text-gray-500 dark:text-gray-400">
          Description
        </label>
        <textarea
          value={form.description}
          onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
          placeholder="Short description for users"
          rows={2}
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs dark:border-gray-700 dark:bg-slate-800 dark:text-gray-100"
        />
      </div>
      <div>
        <label className="mb-1 block text-[11px] font-medium text-gray-500 dark:text-gray-400">
          Profit %
        </label>
        <input
          type="number"
          min={0}
          step={0.01}
          value={form.profit_percentage || ""}
          onChange={(e) => setForm((p) => ({ ...p, profit_percentage: Number(e.target.value) || 0 }))}
          placeholder="0"
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs dark:border-gray-700 dark:bg-slate-800 dark:text-gray-100"
        />
      </div>
      <div>
        <label className="mb-1 block text-[11px] font-medium text-gray-500 dark:text-gray-400">
          Minimum profit ($)
        </label>
        <input
          type="number"
          min={0}
          step={0.01}
          value={form.minimum_profit || ""}
          onChange={(e) => setForm((p) => ({ ...p, minimum_profit: Number(e.target.value) || 0 }))}
          placeholder="0"
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs dark:border-gray-700 dark:bg-slate-800 dark:text-gray-100"
        />
      </div>
      <div>
        <label className="mb-1 block text-[11px] font-medium text-gray-500 dark:text-gray-400">
          Term (days)
        </label>
        <input
          type="number"
          min={1}
          value={form.term_days || ""}
          onChange={(e) => setForm((p) => ({ ...p, term_days: Number(e.target.value) || 30 }))}
          placeholder="30"
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs dark:border-gray-700 dark:bg-slate-800 dark:text-gray-100"
        />
      </div>
      <div>
        <label className="mb-1 block text-[11px] font-medium text-gray-500 dark:text-gray-400">
          Deposit amount ($)
        </label>
        <input
          type="number"
          min={0}
          step={0.01}
          value={form.deposit_amount ?? ""}
          onChange={(e) => setForm((p) => ({ ...p, deposit_amount: Number(e.target.value) || 0 }))}
          placeholder="0"
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs dark:border-gray-700 dark:bg-slate-800 dark:text-gray-100"
        />
        <p className="mt-0.5 text-[10px] text-gray-500 dark:text-gray-400">
          Amount user must deposit for this plan. Shown on Deposit page; credited when deposit proof is accepted.
        </p>
      </div>
      <div className="flex items-center gap-2 sm:col-span-2">
        <input
          type="checkbox"
          id="visible"
          checked={form.visible}
          onChange={(e) => setForm((p) => ({ ...p, visible: e.target.checked }))}
          className="rounded border-gray-300 text-amber-500 focus:ring-amber-500"
        />
        <label htmlFor="visible" className="text-xs text-gray-600 dark:text-gray-400">
          Visible on user dashboard
        </label>
      </div>
    </div>
  );
}

