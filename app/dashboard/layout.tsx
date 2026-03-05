 "use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import ThemeToggle from "../components/ThemeToggle";
import { supabase } from "@/lib/supabase/client";

const sidebarLinks = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Account", href: "/dashboard/account" },
  { label: "Messages", href: "/dashboard/messages" },
  { label: "Plans", href: "/dashboard/plans" },
  { label: "Bonus", href: "/dashboard/bonus" },
  { label: "Transactions", href: "/dashboard/transactions" },
  { label: "Deposit", href: "/dashboard/deposit" },
  { label: "Withdraw", href: "/dashboard/withdraw" },
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
      className={`flex h-screen w-64 flex-col border-r border-gray-200 bg-white/90 px-4 py-6 text-sm shadow-sm dark:border-gray-800 dark:bg-[#050816] ${className}`}
    >
      <div className="mb-6 flex items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-black text-white dark:bg-white dark:text-black">
            W
          </div>
          <span className="text-base font-semibold text-[#141d22] dark:text-gray-100">
            Web
          </span>
        </div>
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
            Dashboard &amp; Account
          </p>
          <ul className="space-y-1">
            {sidebarLinks.slice(0, 6).map((item) => {
              const active = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onNavigate}
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
                    onClick={onNavigate}
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
        onClick={async () => {
          await supabase.auth.signOut();
          document.cookie = "user_session=; path=/; max-age=0";
          window.location.href = "/login";
        }}
        className="mt-4 inline-flex items-center justify-center rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-300 dark:hover:bg-red-900/40"
      >
        Sign Out
      </button>
    </aside>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userName, setUserName] = useState<string>("");
  const [userEmail, setUserEmail] = useState<string>("");

  useEffect(() => {
    const loadUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email ?? "");
        const { data: profile } = await supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle();
        const name = profile?.full_name?.trim() || (user.user_metadata?.full_name ?? user.user_metadata?.name ?? "").trim() || "User";
        setUserName(name);
      }
    };
    loadUser();
  }, []);

  const initial = userName ? userName.charAt(0).toUpperCase() : "U";

  return (
    <div className="min-h-screen w-full bg-gray-50 text-[#141d22] dark:bg-[#020617] dark:text-gray-100 md:flex md:h-screen md:overflow-hidden">
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
                Good Morning 👋
              </span>
              <span className="block truncate text-sm font-semibold text-[#141d22] dark:text-gray-100">
                {userName || "…"}
              </span>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2 sm:gap-4">
            <ThemeToggle />
            <div className="hidden items-center gap-2 sm:flex">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-yellow-400 text-xs font-semibold text-black">
                {initial}
              </div>
              <div className="flex flex-col text-right">
                <span className="text-xs font-medium truncate max-w-[120px]">{userName || "…"}</span>
                <span className="text-[11px] text-gray-500 dark:text-gray-400 truncate max-w-[120px]">
                  {userEmail || "…"}
                </span>
              </div>
            </div>
          </div>
        </header>
        <main className="min-w-0 bg-gray-50 px-4 py-6 dark:bg-[#020617] sm:px-6 md:min-h-0 md:flex-1 md:overflow-y-auto md:overflow-x-hidden md:shrink-0" style={{ WebkitOverflowScrolling: "touch" } as React.CSSProperties}>
          <div className="mx-auto max-w-6xl pb-8 min-h-[calc(100vh-4rem)]">{children}</div>
        </main>
      </div>
    </div>
  );
}

