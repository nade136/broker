import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Admin Overview",
};

const cards = [
  { label: "Total users", value: "—", href: "/admin/users", color: "bg-blue-500/10 text-blue-600 dark:text-blue-400" },
  { label: "Active plans", value: "—", href: "/admin/plans", color: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
  { label: "Pending withdrawals", value: "—", href: "/admin/withdrawals", color: "bg-red-500/10 text-red-600 dark:text-red-400" },
  { label: "Transactions (24h)", value: "—", href: "/admin/transactions", color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
];

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-[#141d22] dark:text-gray-100">
          Admin overview
        </h1>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Control and monitor the user dashboard and platform data.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="rounded-2xl bg-white p-5 shadow-sm transition hover:shadow dark:bg-slate-900 dark:hover:bg-slate-800/80"
          >
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
              {card.label}
            </p>
            <p className={`mt-2 text-2xl font-semibold ${card.color}`}>
              {card.value}
            </p>
            <span className="mt-2 inline-block text-xs text-gray-400 dark:text-gray-500">
              View →
            </span>
          </Link>
        ))}
      </div>

      <div className="rounded-2xl bg-white p-5 shadow-sm dark:bg-slate-900">
        <h2 className="text-base font-semibold text-[#141d22] dark:text-gray-100">
          Quick actions
        </h2>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Manage what users see and do in the user dashboard.
        </p>
        <ul className="mt-4 space-y-2 text-xs">
          <li>
            <Link href="/admin/users" className="text-amber-600 hover:underline dark:text-amber-400">
              Users — view, suspend, or edit user accounts
            </Link>
          </li>
          <li>
            <Link href="/admin/plans" className="text-amber-600 hover:underline dark:text-amber-400">
              Plans — create or edit trading/mining plans shown on user dashboard
            </Link>
          </li>
          <li>
            <Link href="/admin/withdrawals" className="text-amber-600 hover:underline dark:text-amber-400">
              Withdrawals — approve or reject user withdrawal requests
            </Link>
          </li>
          <li>
            <Link href="/admin/settings" className="text-amber-600 hover:underline dark:text-amber-400">
              Settings — platform options that affect the user experience
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
}
