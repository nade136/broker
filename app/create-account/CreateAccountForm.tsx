"use client";

import Link from "next/link";
import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { notifyAdminNewUserSignup } from "./actions";

export default function CreateAccountForm() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [notifyTeamWarning, setNotifyTeamWarning] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setNotifyTeamWarning("");
    setLoading(true);
    const form = e.currentTarget;
    const fullName = (form.elements.namedItem("fullName") as HTMLInputElement).value.trim();
    const email = (form.elements.namedItem("email") as HTMLInputElement).value.trim();
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;

    if (!fullName || !email || !password) {
      setError("Please fill in all fields.");
      setLoading(false);
      return;
    }

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, name: fullName },
      },
    });
    if (signUpError) {
      setError(signUpError.message || "Registration failed.");
      setLoading(false);
      return;
    }

    const notifyResult = await notifyAdminNewUserSignup(email, fullName, data.user?.id ?? null);
    if (!notifyResult.ok) {
      setNotifyTeamWarning(notifyResult.reason);
    }

    if (data.user && data.session) {
      await supabase.auth.signOut();
      document.cookie = "user_session=; path=/; max-age=0";
    }

    const pendingMsg =
      "Your account was created. Your access must be approved before you can sign in. You will receive an email when your access is ready.";
    if (data.user && !data.session) {
      setMessage(`${pendingMsg} If required, check your email to confirm your address, then wait for approval.`);
    } else {
      setMessage(pendingMsg);
    }
    setLoading(false);
  };

  return (
    <div className="animate-hero-in rounded-2xl border border-gray-200 bg-white p-8 shadow-sm opacity-0 transition-shadow duration-300 hover:shadow-lg">
      <h1 className="text-2xl font-bold text-[#141d22]">Create account</h1>
      <p className="mt-2 text-sm text-gray-600">
        Register to access trading, mining, and auto trading.
      </p>
      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
        )}
        {message && (
          <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            {message}
          </p>
        )}
        {notifyTeamWarning && (
          <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900">
            <strong>Notification:</strong> {notifyTeamWarning}
          </p>
        )}
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-[#141d22]">
            Full name
          </label>
          <input
            id="fullName"
            name="fullName"
            type="text"
            autoComplete="name"
            required
            className="mt-2 block w-full rounded-lg border border-gray-300 px-4 py-3 text-[#141d22] placeholder-gray-400 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
            placeholder="John Doe"
          />
        </div>
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
            autoComplete="new-password"
            required
            className="mt-2 block w-full rounded-lg border border-gray-300 px-4 py-3 text-[#141d22] placeholder-gray-400 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
            placeholder="••••••••"
          />
        </div>
        <div className="flex items-start gap-2">
          <input
            id="terms"
            name="terms"
            type="checkbox"
            required
            className="mt-1 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
          />
          <label htmlFor="terms" className="text-sm text-gray-600">
            I agree to the{" "}
            <Link href="/terms-of-services" className="text-teal-600 hover:underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy-policy" className="text-teal-600 hover:underline">
              Privacy Policy
            </Link>
            .
          </label>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-[#141d22] py-3.5 text-base font-medium text-white transition-all duration-300 hover:scale-[1.02] hover:bg-gray-800 hover:shadow-md disabled:opacity-70"
        >
          {loading ? "Creating account…" : "Create account"}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-gray-600">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-teal-600 hover:text-teal-700">
          Log in
        </Link>
      </p>
    </div>
  );
}
