"use client";

import { useState } from "react";
import { approveKyc, rejectKyc, clearKyc } from "./actions";

type Row = {
  id: string;
  user_id: string;
  status: string;
  id_document_url: string | null;
  selfie_url: string | null;
  rejection_reason: string | null;
  submitted_at: string;
  profiles: { full_name: string | null; email: string } | null;
};

export default function KycList({ submissions }: { submissions: Row[] }) {
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [loading, setLoading] = useState<string | null>(null);

  async function handleApprove(id: string) {
    setLoading(id);
    await approveKyc(id);
    setLoading(null);
  }

  async function handleReject(id: string) {
    if (rejectingId !== id) {
      setRejectingId(id);
      setRejectReason("");
      return;
    }
    setLoading(id);
    await rejectKyc(id, rejectReason);
    setLoading(null);
    setRejectingId(null);
    setRejectReason("");
  }

  async function handleClear(id: string) {
    if (!confirm("Remove this verification submission? The user can submit again.")) return;
    setLoading(id);
    await clearKyc(id);
    setLoading(null);
  }

  const pending = submissions.filter((s) => s.status === "pending");
  const other = submissions.filter((s) => s.status !== "pending");

  return (
    <div className="space-y-4">
      {submissions.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 py-8 text-center dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">No KYC submissions yet.</p>
          <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
            Submissions appear here after users upload documents on Dashboard → Verification.
          </p>
        </div>
      ) : (
        <>
          {pending.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-amber-600 dark:text-amber-400">
                Pending ({pending.length})
              </h3>
              {pending.map((row) => (
                <div
                  key={row.id}
                  className="rounded-xl border border-amber-200 bg-amber-50/50 p-4 dark:border-amber-900/50 dark:bg-amber-900/10"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-[#141d22] dark:text-gray-100">
                        {row.profiles?.full_name || row.profiles?.email || row.user_id}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Submitted {new Date(row.submitted_at).toLocaleString()}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {row.id_document_url && (
                          <a
                            href={row.id_document_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-medium text-amber-600 hover:underline dark:text-amber-400"
                          >
                            View ID document →
                          </a>
                        )}
                        {row.selfie_url && (
                          <a
                            href={row.selfie_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-medium text-amber-600 hover:underline dark:text-amber-400"
                          >
                            View selfie →
                          </a>
                        )}
                      </div>
                      {rejectingId === row.id && (
                        <div className="mt-3">
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                            Rejection reason (optional)
                          </label>
                          <input
                            type="text"
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            placeholder="e.g. Document unclear"
                            className="mt-1 w-full max-w-md rounded-lg border border-gray-200 px-3 py-2 text-sm dark:border-gray-700 dark:bg-slate-800 dark:text-gray-100"
                          />
                        </div>
                      )}
                    </div>
                    <div className="flex shrink-0 flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleApprove(row.id)}
                        disabled={loading === row.id}
                        className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
                      >
                        {loading === row.id ? "…" : "Approve"}
                      </button>
                      {rejectingId === row.id ? (
                        <>
                          <button
                            type="button"
                            onClick={() => handleReject(row.id)}
                            disabled={loading === row.id}
                            className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-50"
                          >
                            {loading === row.id ? "…" : "Confirm reject"}
                          </button>
                          <button
                            type="button"
                            onClick={() => setRejectingId(null)}
                            className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-400"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setRejectingId(row.id)}
                          className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 dark:border-red-900/50 dark:text-red-400"
                        >
                          Reject
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleClear(row.id)}
                        disabled={loading === row.id}
                        className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
                      >
                        {loading === row.id ? "…" : "Clear"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {other.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Approved / Rejected
              </h3>
              {other.map((row) => (
                <div
                  key={row.id}
                  className="rounded-xl border border-gray-200 p-4 dark:border-gray-700 dark:bg-slate-900/50"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-medium text-[#141d22] dark:text-gray-100">
                        {row.profiles?.full_name || row.profiles?.email || row.user_id}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {row.status} · {new Date(row.submitted_at).toLocaleString()}
                        {row.rejection_reason && ` · ${row.rejection_reason}`}
                      </p>
                      {(row.id_document_url || row.selfie_url) && (
                        <div className="mt-1 flex gap-2">
                          {row.id_document_url && (
                            <a
                              href={row.id_document_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-amber-600 hover:underline dark:text-amber-400"
                            >
                              ID
                            </a>
                          )}
                          {row.selfie_url && (
                            <a
                              href={row.selfie_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-amber-600 hover:underline dark:text-amber-400"
                            >
                              Selfie
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleClear(row.id)}
                      disabled={loading === row.id}
                      className="shrink-0 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
                    >
                      {loading === row.id ? "…" : "Clear"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
