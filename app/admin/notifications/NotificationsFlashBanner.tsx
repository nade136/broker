"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function NotificationsFlashBanner({ message }: { message: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(true);

  if (!open) return null;

  const lower = message.toLowerCase();
  const isError =
    lower.startsWith("error") ||
    lower.includes("could not remove") ||
    lower.includes("insufficient");
  const emailMiss =
    lower.includes("email not sent") ||
    lower.includes("no user email") ||
    lower.includes("no resend");
  const className = isError
    ? "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300"
    : emailMiss
      ? "bg-amber-50 text-amber-900 dark:bg-amber-900/20 dark:text-amber-200"
      : "bg-emerald-50 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-200";

  function dismiss() {
    setOpen(false);
    router.replace("/admin/notifications");
  }

  return (
    <div
      className={`flex max-w-full items-start gap-2 rounded-lg px-3 py-2 text-xs sm:max-w-xl ${className}`}
      role="status"
    >
      <span className="min-w-0 flex-1">{message}</span>
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss notification"
        className="-m-1 shrink-0 rounded p-1 opacity-70 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
      >
        <span aria-hidden className="text-base leading-none">
          ×
        </span>
      </button>
    </div>
  );
}
