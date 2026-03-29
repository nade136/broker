"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { supabase } from "@/lib/supabase/client";

export default function LoginForm({
  registrationHint,
}: {
  registrationHint?: "pending" | "rejected";
}) {
  const router = useRouter();
  const [error, setError] = useState(
    () =>
      registrationHint === "rejected"
        ? "Your registration was not approved. Contact support if you need help."
        : "",
  );
  const [info, setInfo] = useState(
    () =>
      registrationHint === "pending"
        ? "Your account is pending administrator approval. You will receive an email when you can sign in."
        : "",
  );
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const form = e.currentTarget;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value.trim();
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;

    setInfo("");
    if (!email || !password) {
      setError("Enter email and password.");
      setLoading(false);
      return;
    }

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (signInError) {
      setError(signInError.message || "Invalid email or password.");
      setLoading(false);
      return;
    }
    if (!data.user) {
      setError("Sign in failed.");
      setLoading(false);
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("account_status, role")
      .eq("id", data.user.id)
      .maybeSingle();

    const allowed =
      profile?.role === "admin" || profile?.account_status === "approved";

    if (!allowed) {
      await supabase.auth.signOut();
      document.cookie = "user_session=; path=/; max-age=0";
      if (profile?.account_status === "rejected") {
        setError("Your registration was not approved. Contact support if you need help.");
      } else {
        setError("Your account is pending administrator approval. You will receive an email when you can sign in.");
      }
      setLoading(false);
      return;
    }

    document.cookie = `user_session=1; path=/; max-age=${60 * 60 * 24 * 7}`;
    router.push("/dashboard");
    router.refresh();
    setLoading(false);
  };

  return (
    <div className="animate-hero-in rounded-2xl border border-gray-200 bg-white p-8 shadow-sm opacity-0 transition-shadow duration-300 hover:shadow-lg">
      <h1 className="text-2xl font-bold text-[#141d22]">Log in</h1>
      <p className="mt-2 text-sm text-gray-600">
        Enter your credentials to access your account.
      </p>
      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
        )}
        {info && !error && (
          <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{info}</p>
        )}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-[#141d22]">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="mt-2 block w-full rounded-lg border border-gray-300 px-4 py-3 text-[#141d22] placeholder-gray-400 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-[#141d22]">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="mt-2 block w-full rounded-lg border border-gray-300 px-4 py-3 text-[#141d22] placeholder-gray-400 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
            placeholder="••••••••"
          />
        </div>
        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2">
            <input type="checkbox" name="remember" className="rounded border-gray-300 text-teal-600 focus:ring-teal-500" />
            <span className="text-gray-600">Remember me</span>
          </label>
          <Link href="#" className="text-teal-600 hover:text-teal-700">
            Forgot password?
          </Link>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-[#141d22] py-3.5 text-base font-medium text-white transition-all duration-300 hover:scale-[1.02] hover:bg-gray-800 hover:shadow-md disabled:opacity-70"
        >
          {loading ? "Logging in…" : "Log in"}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-gray-600">
        Don&apos;t have an account?{" "}
        <Link href="/create-account" className="font-medium text-teal-600 hover:text-teal-700">
          Create account
        </Link>
      </p>
    </div>
  );
}
