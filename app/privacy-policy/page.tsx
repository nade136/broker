import type { Metadata } from "next";
import Header from "../components/Header";
import Footer from "../components/Footer";
import AnimateIn from "../components/AnimateIn";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Bridgecore collects, uses, and protects your personal information.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-white text-[#141d22]">
      <Header />
      <main className="px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <AnimateIn className="mx-auto max-w-3xl" variant="up">
          <h1 className="text-3xl font-bold text-[#141d22]">Privacy Policy</h1>
          <p className="mt-4 text-gray-500">Last updated: 2026</p>
          <div className="mt-8 space-y-6 text-gray-600 leading-relaxed">
            <p>
              Bridgecore is committed to protecting your privacy. This policy describes how we collect, use, store, and safeguard your personal information when you use our platform.
            </p>
            <p>
              We collect information you provide (e.g. name, email, account details), usage data, and technical data necessary for security and service improvement. We do not sell your personal data to third parties. We may share data with regulators or service providers as required by law or to operate our services.
            </p>
            <p>
              For the full privacy policy, contact support@bitrexify.com or review the document provided at registration.
            </p>
          </div>
        </AnimateIn>
      </main>
      <Footer />
    </div>
  );
}
