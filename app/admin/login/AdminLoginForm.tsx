"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { supabase } from "@/lib/supabase/client";

export default function AdminLoginForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const form = e.currentTarget;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value.trim();
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;

    if (!email || !password) {
      setError("Enter email and password.");
      setLoading(false);
      return;
    }

    const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (signInError) {
      setError(signInError.message || "Invalid email or password.");
      setLoading(false);
      return;
    }
    if (!authData.user) {
      setError("Sign in failed.");
      setLoading(false);
      return;
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", authData.user.id)
      .maybeSingle();

    if (profileError) {
      await supabase.auth.signOut();
      setError(
        "Could not load profile. Run the RLS fix in Supabase: run the SQL in supabase/migrations/002_fix_profiles_rls.sql"
      );
      setLoading(false);
      return;
    }
    if (!profile || profile.role !== "admin") {
      await supabase.auth.signOut();
      setError(
        "This account does not have access to this sign-in page. If you should have access, ask the person who manages Bridgecore to grant staff privileges for your account in Supabase."
      );
      setLoading(false);
      return;
    }

    document.cookie = `admin_session=1; path=/; max-age=${60 * 60 * 24 * 7}`;
    router.push("/admin");
    router.refresh();
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-[#141d22] dark:bg-[#020617] dark:text-gray-100">
      <main className="flex min-h-[60vh] items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          <Link
            href="/"
            className="mb-4 inline-flex items-center text-sm font-medium text-gray-700 transition-colors hover:text-amber-600 dark:text-gray-300 dark:hover:text-amber-400"
          >
            <span className="mr-2 text-lg">←</span>
            Back to site
          </Link>
          <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-slate-900">
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-amber-500 text-sm font-semibold text-white">
                B
              </div>
              <div>
                <h1 className="text-lg font-semibold text-[#141d22] dark:text-gray-100">
                  Staff sign-in
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Sign in to access the control dashboard.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-5">
              {error && (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600 dark:bg-red-900/20 dark:text-red-400">
                  {error}
                </p>
              )}
              <div>
                <label htmlFor="staff-email" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                  Email
                </label>
                <input
                  id="staff-email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  className="mt-2 block w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-[#141d22] placeholder-gray-400 outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 dark:border-gray-700 dark:bg-slate-950 dark:text-gray-100"
                  placeholder="you@bridgecore.live"
                />
              </div>
              <div>
                <label htmlFor="staff-password" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                  Password
                </label>
                <input
                  id="staff-password"
                  name="password"
                  type="password"
                  required
                  autoComplete="current-password"
                  className="mt-2 block w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-[#141d22] placeholder-gray-400 outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 dark:border-gray-700 dark:bg-slate-950 dark:text-gray-100"
                  placeholder="••••••••"
                />
              </div>
              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="remember"
                    className="rounded border-gray-300 text-amber-500 focus:ring-amber-500"
                  />
                  <span className="text-gray-600 dark:text-gray-400">Remember this device</span>
                </label>
                <button
                  type="button"
                  className="text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300"
                >
                  Forgot password?
                </button>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="mt-2 w-full rounded-full bg-[#141d22] py-3 text-sm font-semibold text-white transition-all duration-200 hover:scale-[1.01] hover:bg-black disabled:opacity-70 dark:bg-amber-500 dark:hover:bg-amber-600"
              >
                {loading ? "Signing in…" : "Sign in"}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
