"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import SmartsuppChat from "../components/SmartsuppChat";
import ThemeToggle from "../components/ThemeToggle";

const sidebarLinks = [
  { label: "Dashboard", href: "/app" },
  { label: "Account", href: "/app/account" },
  { label: "Plans", href: "/app/plans" },
  { label: "Bonus", href: "/app/bonus" },
  { label: "Transactions", href: "/app/transactions" },
  { label: "Deposit", href: "/app/deposit" },
  { label: "Withdraw", href: "/app/withdraw" },
];

function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-gray-200 bg-white/90 px-4 py-6 text-sm shadow-sm dark:border-gray-800 dark:bg-[#050816]">
      <div className="mb-6 flex items-center gap-2 px-1">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-black text-sm font-semibold text-white dark:bg-white dark:text-black">
          B
        </div>
        <span className="text-base font-semibold text-[#141d22] dark:text-gray-100">
          Bridgecore
        </span>
      </div>

      <nav className="flex-1 space-y-4 overflow-y-auto pr-1">
        <div>
          <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">
            Dashboard &amp; Account
          </p>
          <ul className="space-y-1">
            {sidebarLinks.slice(0, 6).map((item) => {
              const active = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                      active
                        ? "bg-yellow-400/10 text-yellow-500"
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

        <div>
          <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">
            Funds
          </p>
          <ul className="space-y-1">
            {sidebarLinks.slice(6, 8).map((item) => {
              const active = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                      active
                        ? "bg-yellow-400/10 text-yellow-500"
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

      <button
        type="button"
        className="mt-4 inline-flex items-center justify-center rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-300 dark:hover:bg-red-900/40"
      >
        Sign Out
      </button>
    </aside>
  );
}

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
    <div className="flex min-h-screen bg-gray-50 text-[#141d22] dark:bg-[#020617] dark:text-gray-100">
      <Sidebar />
      <div className="flex min-h-screen flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-gray-200 bg-white/80 px-6 py-3 text-sm shadow-sm backdrop-blur dark:border-gray-800 dark:bg-[#020617]/80">
          <div className="flex flex-col">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Good Morning 👋
            </span>
            <span className="text-sm font-semibold text-[#141d22] dark:text-gray-100">
              nade like
            </span>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-400 text-xs font-semibold text-black">
                N
              </div>
              <div className="flex flex-col text-right">
                <span className="text-xs font-medium">nade like</span>
                <span className="text-[11px] text-gray-500 dark:text-gray-400">
                  allenmunadek@gmail.com
                </span>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-gray-50 px-6 py-6 dark:bg-[#020617]">
          <div className="mx-auto max-w-6xl min-h-[calc(100vh-4rem)]">{children}</div>
        </main>
      </div>
    </div>
    <SmartsuppChat />
    </>
  );
}

