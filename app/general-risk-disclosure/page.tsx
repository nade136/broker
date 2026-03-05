import type { Metadata } from "next";
import Header from "../components/Header";
import Footer from "../components/Footer";
import AnimateIn from "../components/AnimateIn";

export const metadata: Metadata = {
  title: "General Risk Disclosure",
  description: "Important risk information for trading and investing with Web.",
};

export default function GeneralRiskDisclosurePage() {
  return (
    <div className="min-h-screen bg-white text-[#141d22]">
      <Header />
      <main className="px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <AnimateIn className="mx-auto max-w-3xl" variant="up">
          <h1 className="text-3xl font-bold text-[#141d22]">General Risk Disclosure</h1>
          <p className="mt-4 text-gray-500">Last updated: 2026</p>
          <div className="mt-8 space-y-6 text-gray-600 leading-relaxed">
            <p className="font-medium text-[#141d22]">
              Trading leveraged financial instruments such as forex, CFDs, and digital assets carries a high level of risk and may not be suitable for all investors.
            </p>
            <p>
              You could lose all your invested capital. Past performance is not indicative of future results. Ensure you fully understand the risks and seek independent advice if necessary. Web is not liable for any losses or damages arising directly or indirectly from trading activity based on information provided on this platform.
            </p>
            <p>
              For the complete risk disclosure, contact support@bitrexify.com or refer to the document provided at account opening.
            </p>
          </div>
        </AnimateIn>
      </main>
      <Footer />
    </div>
  );
}
