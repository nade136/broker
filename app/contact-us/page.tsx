import type { Metadata } from "next";
import Link from "next/link";
import Header from "../components/Header";
import Footer from "../components/Footer";
import CtaSection from "../components/CtaSection";
import AnimateIn from "../components/AnimateIn";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with Web. We're here to help with questions, feedback, or business inquiries. Quick and efficient support.",
};

export default function ContactUsPage() {
  return (
    <div className="min-h-screen bg-white text-[#141d22]">
      <Header />
      <main>
        {/* Hero */}
        <section className="bg-gradient-to-b from-gray-50 to-white px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="animate-hero-in mx-auto max-w-3xl text-center opacity-0">
            <h1 className="text-4xl font-bold tracking-tight text-[#141d22] sm:text-5xl">
              We&apos;re Here to Help - Get in Touch Anytime
            </h1>
            <p className="mt-6 text-lg text-gray-600">
              At Web, we value your time and are committed to providing quick and efficient support. Whether you have questions, feedback, or business inquiries, our team is ready to assist you.
            </p>
          </div>
        </section>

        {/* General Enquiries */}
        <AnimateIn as="section" variant="up" className="bg-white px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="mx-auto max-w-4xl">
            <h2 className="text-2xl font-bold text-[#141d22]">General Enquiries</h2>
            <div className="mt-8 rounded-2xl border border-gray-200 bg-gray-50/50 p-8 transition-all duration-300 hover:shadow-md">
              <ul className="space-y-4 text-gray-700">
                <li>
                  <span className="font-semibold text-[#141d22]">Address:</span>{" "}
                  Sydney, Australia
                </li>
                <li>
                  <span className="font-semibold text-[#141d22]">Phone:</span>{" "}
                  <a href="tel:+10000000" className="text-teal-600 transition-colors hover:underline hover:text-teal-700">+1 000 0000</a>
                </li>
                <li>
                  <span className="font-semibold text-[#141d22]">Email:</span>{" "}
                  <a href="mailto:support@bitrexify.com" className="text-teal-600 transition-colors hover:underline hover:text-teal-700">support@bitrexify.com</a>
                </li>
                <li>
                  <span className="font-semibold text-[#141d22]">Working Hours:</span>{" "}
                  Mon - Fri, 9:00 AM - 6:00 PM (GMT+1)
                </li>
              </ul>
            </div>

            <div className="mt-12 rounded-2xl border border-gray-200 bg-white p-8 shadow-sm transition-all duration-300 hover:shadow-lg">
              <h3 className="text-xl font-semibold text-[#141d22]">Open a ticket</h3>
              <p className="mt-4 text-gray-600">
                Already registered? Log in to your Dashboard, go to the support page, and submit a ticket there. We&apos;ll get back to you in less than 24 hours.
              </p>
              <div className="mt-6 flex flex-wrap gap-4">
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center rounded-full bg-[#141d22] px-6 py-3 text-sm font-medium text-white transition-all duration-300 hover:scale-105 hover:bg-gray-800 hover:shadow-md"
                >
                  Log in to Dashboard
                </Link>
                <Link
                  href="/create-account"
                  className="inline-flex items-center justify-center rounded-full border-2 border-[#141d22] px-6 py-3 text-sm font-medium text-[#141d22] transition-all duration-300 hover:scale-105 hover:bg-gray-100 hover:shadow-md"
                >
                  Create Account
                </Link>
              </div>
            </div>
          </div>
        </AnimateIn>

        <AnimateIn variant="scale">
          <CtaSection />
        </AnimateIn>
      </main>
      <Footer />
    </div>
  );
}
