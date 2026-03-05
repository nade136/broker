import type { Metadata } from "next";
import Header from "../components/Header";
import Footer from "../components/Footer";
import AnimateIn from "../components/AnimateIn";

export const metadata: Metadata = {
  title: "Responsible Trading",
  description: "Web's commitment to responsible trading and user protection.",
};

export default function ResponsibleTradingPage() {
  return (
    <div className="min-h-screen bg-white text-[#141d22]">
      <Header />
      <main className="px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <AnimateIn className="mx-auto max-w-3xl" variant="up">
          <h1 className="text-3xl font-bold text-[#141d22]">Responsible Trading</h1>
          <p className="mt-4 text-gray-500">Last updated: 2026</p>
          <div className="mt-8 space-y-6 text-gray-600 leading-relaxed">
            <p>
              Web is committed to promoting responsible trading. We encourage our users to trade within their means, set limits, and use the tools we provide (e.g. demo accounts, risk controls) to manage risk.
            </p>
            <p>
              If you believe you may have a gambling or trading addiction, please seek help from a professional. We support self-exclusion and can help you limit or close your account upon request.
            </p>
            <p>
              For more information, contact support@bitrexify.com.
            </p>
          </div>
        </AnimateIn>
      </main>
      <Footer />
    </div>
  );
}
