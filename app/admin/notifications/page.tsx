import type { Metadata } from "next";
import { createSupabaseAdmin } from "@/lib/supabase/server";
import NotificationList from "./NotificationList";
import NotificationsFlashBanner from "./NotificationsFlashBanner";
import { markAllNotificationsRead, clearAllNotifications } from "./actions";

export const metadata: Metadata = {
  title: "Notifications",
};

type NotificationsPageProps = {
  searchParams?: Promise<{ flash?: string }>;
};

export default async function AdminNotificationsPage({ searchParams }: NotificationsPageProps) {
  const flash = searchParams ? (await searchParams).flash?.trim() : undefined;
  const supabase = createSupabaseAdmin();
  const { data: notifications } = await supabase
    .from("notifications")
    .select(
      `
      id,
      type,
      user_id,
      title,
      message,
      metadata,
      read_at,
      created_at,
      profiles ( full_name, email )
    `
    )
    .order("created_at", { ascending: false })
    .limit(100);

  const list = (notifications ?? []).map((n: any) => ({
    ...n,
    profiles: Array.isArray(n.profiles) ? n.profiles[0] ?? null : n.profiles,
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-lg font-semibold text-[#141d22] dark:text-gray-100">
            Notifications
          </h1>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            New signups, logins, withdrawal requests, deposit proofs, and more.
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          {flash && <NotificationsFlashBanner message={flash} />}

      {list.some((n) => !n.read_at) && (
            <form action={markAllNotificationsRead}>
              <button
                type="submit"
                className="rounded-lg bg-amber-500 px-3 py-2 text-xs font-semibold text-white hover:bg-amber-600"
              >
                Mark all read
              </button>
            </form>
          )}
          {list.length > 0 && (
            <form action={clearAllNotifications}>
              <button
                type="submit"
                className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-900/20"
              >
                Clear all
              </button>
            </form>
          )}
        </div>
      </div>

      <NotificationList notifications={list as any} />
    </div>
  );
}
