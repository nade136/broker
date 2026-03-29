import { createSupabaseAdmin } from "@/lib/supabase/server";
import AdminUsersClient, { type AdminUserProfile } from "./AdminUsersClient";

/** Always fetch fresh profile list (signups / approvals update often). */
export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, full_name, role, created_at")
    .order("created_at", { ascending: false });

  return (
    <AdminUsersClient
      initialProfiles={(data ?? []) as AdminUserProfile[]}
      listError={error?.message ?? null}
    />
  );
}
