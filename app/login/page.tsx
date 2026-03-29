import type { Metadata } from "next";
import Link from "next/link";
import Footer from "../components/Footer";
import LoginForm from "./LoginForm";

export const metadata: Metadata = {
  title: "Login",
  description: "Log in to your Bridgecore account to access trading, mining, and support.",
};

type LoginPageProps = {
  searchParams?: Promise<{ registration?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const sp = searchParams ? await searchParams : {};
  const registrationHint =
    sp.registration === "pending" || sp.registration === "rejected"
      ? sp.registration
      : undefined;

  return (
    <div className="min-h-screen bg-white text-[#141d22]">
      <main className="min-h-[60vh] flex items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          <Link
            href="/"
            className="mb-4 inline-flex items-center text-sm font-medium text-[#141d22] transition-colors hover:text-teal-700"
          >
            <span className="mr-2 text-lg">←</span>
            Back to home
          </Link>
          <LoginForm registrationHint={registrationHint} />
        </div>
      </main>
      <Footer />
    </div>
  );
}
