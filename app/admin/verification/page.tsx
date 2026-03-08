import type { Metadata } from "next";
import { createSupabaseAdmin } from "@/lib/supabase/server";
import KycList from "./KycList";

export const metadata: Metadata = {
  title: "Verification",
};

export default async function AdminVerificationPage() {
  const supabase = createSupabaseAdmin();

  const { data: rows, error } = await supabase
    .from("kyc_submissions")
    .select("id, user_id, status, id_document_url, selfie_url, rejection_reason, submitted_at")
    .order("submitted_at", { ascending: false });

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-lg font-semibold text-[#141d22] dark:text-gray-100">KYC verification</h1>
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/50 dark:bg-amber-900/20">
          <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
            Could not load submissions. Run the migration: <code className="rounded bg-amber-200/50 px-1 dark:bg-amber-900/50">018_kyc_submissions.sql</code>
          </p>
          <p className="mt-1 text-xs text-amber-700 dark:text-amber-300">{error.message}</p>
        </div>
      </div>
    );
  }

  const list = rows ?? [];
  const userIds = [...new Set(list.map((r) => r.user_id))];
  let profilesMap: Record<string, { full_name: string | null; email: string }> = {};
  if (userIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name, email")
      .in("id", userIds);
    if (profiles) {
      profilesMap = Object.fromEntries(profiles.map((p) => [p.id, { full_name: p.full_name ?? null, email: p.email ?? "" }]));
    }
  }

  const listWithProfiles = list.map((r) => ({
    ...r,
    profiles: profilesMap[r.user_id] ?? null,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-[#141d22] dark:text-gray-100">
          KYC verification
        </h1>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Review and approve or reject user document submissions.
        </p>
      </div>
      <KycList submissions={listWithProfiles} />
    </div>
  );
}
