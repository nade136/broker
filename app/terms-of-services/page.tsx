import type { Metadata } from "next";
import Header from "../components/Header";
import Footer from "../components/Footer";
import AnimateIn from "../components/AnimateIn";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Bridgecore terms of service and conditions of use.",
};

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-white text-[#141d22]">
      <Header />
      <main className="px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <AnimateIn className="mx-auto max-w-3xl" variant="up">
          <h1 className="text-3xl font-bold text-[#141d22]">Terms of Service</h1>
          <p className="mt-4 text-gray-500">Last updated: 2026</p>
          <div className="mt-8 space-y-6 text-gray-600 leading-relaxed">
            <p>
              By accessing or using Bridgecore services, you agree to be bound by these Terms of Service. Please read them carefully.
            </p>
            <p>
              These terms govern your use of our trading, mining, and investment platform. You must be of legal age in your jurisdiction to use our services. We reserve the right to update these terms; continued use after changes constitutes acceptance.
            </p>
            <p>
              For full terms and conditions, please contact support@bitrexify.com or refer to the agreement provided at account registration.
            </p>
          </div>
        </AnimateIn>
      </main>
      <Footer />
    </div>
  );
}
