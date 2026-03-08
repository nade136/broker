"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { submitKyc } from "./actions";

type KycRow = {
  status: string;
  id_document_url: string | null;
  selfie_url: string | null;
  rejection_reason: string | null;
  submitted_at: string;
};

export default function VerificationForm() {
  const [kyc, setKyc] = useState<KycRow | null | "none">(null);
  const [idFile, setIdFile] = useState<File | null>(null);
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "uploading" | "sending" | "done" | "error">("idle");
  const [message, setMessage] = useState("");
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setKyc("none");
        return;
      }
      setUserId(user.id);
      const { data } = await supabase
        .from("kyc_submissions")
        .select("status, id_document_url, selfie_url, rejection_reason, submitted_at")
        .eq("user_id", user.id)
        .maybeSingle();
      setKyc(data ?? "none");
    };
    load();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!idFile || !userId) {
      setMessage(idFile ? "Session expired. Please refresh." : "Please upload an ID document.");
      setStatus("error");
      return;
    }

    setStatus("uploading");
    setMessage("");

    try {
      const ext = idFile.name.split(".").pop() || "png";
      const idPath = `${userId}/${Date.now()}-id.${ext}`;
      const { error: idError } = await supabase.storage
        .from("kyc-documents")
        .upload(idPath, idFile, { upsert: false });

      if (idError) {
        const msg = idError.message ?? "";
        const isBucketMissing = msg.toLowerCase().includes("bucket") || msg.toLowerCase().includes("not found");
        const display = isBucketMissing
          ? "Storage bucket missing. Create it: run « node --env-file=.env.local scripts/create-kyc-bucket.mjs » then run supabase/storage-policy-kyc-documents.sql in Supabase SQL Editor."
          : msg || "ID upload failed.";
        setMessage(display);
        setStatus("error");
        return;
      }

      const { data: idUrlData } = supabase.storage.from("kyc-documents").getPublicUrl(idPath);
      let selfieUrl: string | null = null;

      if (selfieFile) {
        const selfieExt = selfieFile.name.split(".").pop() || "png";
        const selfiePath = `${userId}/${Date.now()}-selfie.${selfieExt}`;
        const { error: selfieError } = await supabase.storage
          .from("kyc-documents")
          .upload(selfiePath, selfieFile, { upsert: false });
        if (!selfieError) {
          const { data: selfieUrlData } = supabase.storage.from("kyc-documents").getPublicUrl(selfiePath);
          selfieUrl = selfieUrlData.publicUrl;
        }
      }

      setStatus("sending");
      const result = await submitKyc(userId, idUrlData.publicUrl, selfieUrl);

      if (result.ok) {
        setMessage("Documents submitted. We will review and notify you once verified.");
        setStatus("done");
        setIdFile(null);
        setSelfieFile(null);
        setKyc({
          status: "pending",
          id_document_url: idUrlData.publicUrl,
          selfie_url: selfieUrl,
          rejection_reason: null,
          submitted_at: new Date().toISOString(),
        });
      } else {
        setMessage(result.error);
        setStatus("error");
      }
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Something went wrong.");
      setStatus("error");
    }
  }

  if (kyc === null) {
    return (
      <div className="rounded-xl border border-gray-100 bg-white px-5 py-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <p className="text-sm text-gray-500 dark:text-gray-400">Loading…</p>
      </div>
    );
  }

  const isApproved = kyc !== "none" && (kyc as KycRow).status === "approved";
  const isPending = kyc !== "none" && (kyc as KycRow).status === "pending";
  const isRejected = kyc !== "none" && (kyc as KycRow).status === "rejected";

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-gray-100 bg-white px-5 py-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-1 text-base font-semibold text-[#141d22] dark:text-gray-100">
          Document verification (KYC)
        </h2>
        <p className="mb-4 text-xs text-gray-500 dark:text-gray-400">
          Submit an ID document so we can verify your account. Optional: add a selfie.
        </p>

        {isApproved && (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 dark:border-emerald-900/50 dark:bg-emerald-900/20">
            <p className="text-sm font-medium text-emerald-800 dark:text-emerald-200">
              Your identity has been verified.
            </p>
          </div>
        )}

        {isRejected && kyc !== "none" && (kyc as KycRow).rejection_reason && (
          <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-900/50 dark:bg-amber-900/20">
            <p className="text-xs font-medium text-amber-800 dark:text-amber-200">
              Previous submission was declined: {(kyc as KycRow).rejection_reason}
            </p>
            <p className="mt-1 text-xs text-amber-700 dark:text-amber-300">
              You can submit new documents below.
            </p>
          </div>
        )}

        {isPending && (
          <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-900/50 dark:bg-amber-900/20">
            <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
              Your documents are under review. We will notify you once approved.
            </p>
          </div>
        )}

        {(!isApproved || isRejected) && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300">
                ID document (required)
              </label>
              <input
                type="file"
                accept="image/*,.pdf"
                required={!isPending}
                onChange={(e) => setIdFile(e.target.files?.[0] ?? null)}
                className="block w-full text-sm text-gray-500 file:mr-3 file:rounded-lg file:border-0 file:bg-amber-500 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-white file:hover:bg-amber-600"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300">
                Selfie (optional)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setSelfieFile(e.target.files?.[0] ?? null)}
                className="block w-full text-sm text-gray-500 file:mr-3 file:rounded-lg file:border-0 file:bg-gray-200 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-gray-700 dark:file:bg-slate-700 dark:file:text-gray-200"
              />
            </div>
            {message && (
              <p className={`text-sm ${status === "error" ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400"}`}>
                {message}
              </p>
            )}
            <button
              type="submit"
              disabled={status === "uploading" || status === "sending"}
              className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-amber-600 disabled:opacity-50"
            >
              {status === "uploading" || status === "sending" ? "Submitting…" : "Submit for verification"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
