import type { Metadata } from "next";
import Link from "next/link";
import { createSupabaseAdmin } from "@/lib/supabase/server";
import AdminUserDetailClient from "./AdminUserDetailClient";
import { ACCOUNT_TYPES } from "./constants";
import { getDepositConfigForUser } from "@/app/admin/actions/deposit-methods";
import { getAdminUserMessages, getCryptoAddressesForUser, getWithdrawalConfigForUser, getWithdrawalOptionsForUser } from "./actions";

export const metadata: Metadata = {
  title: "User account",
};

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: userId } = await params;
  const supabase = createSupabaseAdmin();

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, email, full_name, firstname, lastname, address, status")
    .eq("id", userId)
    .single();

  if (profileError || !profile) {
    return (
      <div className="space-y-4">
        <Link href="/admin/users" className="text-xs font-medium text-amber-600 hover:underline dark:text-amber-400">
          ← Back to users
        </Link>
        <p className="text-sm text-gray-600 dark:text-gray-400">User not found.</p>
      </div>
    );
  }

  const { data: balanceRows } = await supabase
    .from("account_balances")
    .select("account_type, balance")
    .eq("user_id", userId);

  const balanceMap: Record<(typeof ACCOUNT_TYPES)[number], string> = {
    spot: "0",
    profit: "0",
    initial_deposit: "0",
    mining: "0",
    bonus: "0",
  };
  for (const row of balanceRows ?? []) {
    if (row.account_type in balanceMap) {
      balanceMap[row.account_type as (typeof ACCOUNT_TYPES)[number]] = String(Number(row.balance));
    }
  }

  const initialProfile = {
    firstname: profile.firstname ?? profile.full_name?.split(" ")[0] ?? "",
    lastname: profile.lastname ?? profile.full_name?.split(" ").slice(1).join(" ") ?? "",
    email: profile.email ?? "",
    address: profile.address ?? "",
    status: profile.status ?? "Active",
  };

  const initialMessages = await getAdminUserMessages(userId);

  const { data: transferRows } = await supabase
    .from("transfer_history")
    .select("id, type, amount, status, note, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(50);

  const [initialDepositConfig, initialCryptoAddresses, initialWithdrawalConfig, initialWithdrawalOptions] = await Promise.all([
    getDepositConfigForUser(userId),
    getCryptoAddressesForUser(userId),
    getWithdrawalConfigForUser(userId),
    getWithdrawalOptionsForUser(userId),
  ]);

  return (
    <AdminUserDetailClient
      userId={userId}
      initialProfile={initialProfile}
      initialBalances={balanceMap}
      initialMessages={initialMessages}
      initialTransferHistory={(transferRows ?? []) as { id: string; type: string; amount: number; status: string; note: string | null; created_at: string }[]}
      initialDepositConfig={initialDepositConfig}
      initialCryptoAddresses={initialCryptoAddresses}
      initialWithdrawalConfig={initialWithdrawalConfig}
      initialWithdrawalOptions={initialWithdrawalOptions}
    />
  );
}
