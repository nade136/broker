"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import ThemeToggle from "../components/ThemeToggle";

const ADMIN_LOGIN = "/admin/login";

const adminLinks = [
  { label: "Overview", href: "/admin" },
  { label: "Notifications", href: "/admin/notifications" },
  { label: "Verification", href: "/admin/verification" },
  { label: "Users", href: "/admin/users" },
  { label: "Plans", href: "/admin/plans" },
  { label: "Deposit methods", href: "/admin/deposit-methods" },
  { label: "Transactions", href: "/admin/transactions" },
  { label: "Withdrawals", href: "/admin/withdrawals" },
  { label: "Settings", href: "/admin/settings" },
];

function Sidebar({
  onNavigate,
  className = "",
}: {
  onNavigate?: () => void;
  className?: string;
}) {
  const pathname = usePathname();

  return (
    <aside
      className={`flex h-screen w-64 flex-col border-r border-gray-200 bg-white/90 px-4 py-6 text-sm shadow-sm dark:border-gray-800 dark:bg-slate-900 ${className}`}
    >
      <div className="mb-6 flex items-center justify-between gap-2 px-1">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-amber-600 text-sm font-semibold text-white">
            B
          </div>
          <span className="text-base font-semibold text-[#141d22] dark:text-gray-100">
            Bridgecore Control
          </span>
        </Link>
        {onNavigate && (
          <button
            type="button"
            onClick={onNavigate}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-300"
            aria-label="Close menu"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      <nav className="flex-1 min-h-0 space-y-4 overflow-y-auto pr-1" style={{ WebkitOverflowScrolling: "touch" } as React.CSSProperties}>
        <div>
          <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">
            Control
          </p>
          <ul className="space-y-1">
            {adminLinks.map((item) => {
              const active = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    className={`flex items-center rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                      active
                        ? "bg-amber-500/20 text-amber-600 dark:text-amber-400"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>

      <div className="mt-4 border-t border-gray-200 pt-4 dark:border-gray-700">
        <button
          type="button"
          onClick={() => {
            document.cookie = "admin_session=; path=/; max-age=0";
            window.location.href = ADMIN_LOGIN;
          }}
          className="w-full rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-300 dark:hover:bg-red-900/40"
        >
          Sign Out
        </button>
      </div>
    </aside>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (pathname === ADMIN_LOGIN) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen w-full bg-gray-50 text-[#141d22] dark:bg-[#020617] dark:text-gray-100 md:flex md:h-screen md:flex-row md:overflow-hidden">
      {sidebarOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close menu"
        />
      )}
      <Sidebar className="hidden md:flex" />
      <Sidebar
        className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-200 ease-out md:hidden ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        onNavigate={() => setSidebarOpen(false)}
      />
      {/* Mobile: block flow so body scrolls like homepage. Desktop: flex-1 + scroll inside main. */}
      <div className="min-w-0 block md:flex md:min-h-0 md:flex-1 md:flex-col md:overflow-hidden">
        <header className="flex shrink-0 items-center justify-between gap-2 border-b border-gray-200 bg-white/80 px-4 py-3 text-sm shadow-sm backdrop-blur dark:border-gray-800 dark:bg-[#020617]/80 sm:px-6">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <button
              type="button"
              className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 md:hidden"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="min-w-0 flex-1">
              <span className="block truncate text-xs text-gray-500 dark:text-gray-400">
                Control
              </span>
              <span className="block truncate text-sm font-semibold text-[#141d22] dark:text-gray-100">
                Control user dashboard
              </span>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2 sm:gap-4">
            <ThemeToggle />
          </div>
        </header>
        <main className="min-w-0 bg-gray-50 px-4 py-6 dark:bg-[#020617] sm:px-6 md:min-h-0 md:flex-1 md:overflow-y-auto md:overflow-x-hidden" style={{ WebkitOverflowScrolling: "touch" } as React.CSSProperties}>
          <div className="mx-auto max-w-6xl pb-8 min-h-[calc(100vh-4rem)]">{children}</div>
        </main>
      </div>
    </div>
  );
}
