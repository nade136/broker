import type { Metadata } from "next";
import Header from "../components/Header";
import Footer from "../components/Footer";
import AnimateIn from "../components/AnimateIn";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description: "How Bridgecore uses cookies and similar technologies.",
};

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen bg-white text-[#141d22]">
      <Header />
      <main className="px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <AnimateIn className="mx-auto max-w-3xl" variant="up">
          <h1 className="text-3xl font-bold text-[#141d22]">Cookie Policy</h1>
          <p className="mt-4 text-gray-500">Last updated: 2026</p>
          <div className="mt-8 space-y-6 text-gray-600 leading-relaxed">
            <p>
              Bridgecore uses cookies and similar technologies to improve your experience, maintain security, and analyze site usage.
            </p>
            <p>
              We use essential cookies for login and security, functional cookies for preferences, and analytics cookies to understand how our site is used. You can manage cookie preferences in your browser settings.
            </p>
            <p>
              For full details, contact support@bitrexify.com.
            </p>
          </div>
        </AnimateIn>
      </main>
      <Footer />
    </div>
  );
}
