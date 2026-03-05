import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import Header from "../components/Header";
import Footer from "../components/Footer";
import CtaSection from "../components/CtaSection";
import AnimateIn from "../components/AnimateIn";

const UNSPLASH = "https://images.unsplash.com";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Empowering you to trade smarter, mine better, and earn more. Next-generation trading and investment platform built to give individuals the same powerful tools once reserved for professionals.",
};

export default function AboutUsPage() {
  return (
    <div className="min-h-screen bg-white text-[#141d22]">
      <Header />
      <main>
        {/* Hero */}
        <section className="bg-gradient-to-b from-gray-50 to-white px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="mx-auto max-w-7xl">
            <div className="grid items-center gap-12 lg:grid-cols-2">
              <div className="animate-hero-in opacity-0">
                <h1 className="text-4xl font-bold tracking-tight text-[#141d22] sm:text-5xl">
                  Empowering You to Trade Smarter, Mine Better, and Earn More
                </h1>
                <p className="mt-6 text-lg text-gray-600">
                  We are a next-generation trading and investment platform built to give individuals the same powerful tools and opportunities once reserved for professionals and institutions.
                </p>
                <div className="mt-10 flex flex-wrap gap-4">
                  <Link
                    href="/create-account"
                    className="inline-flex items-center justify-center rounded-full bg-[#141d22] px-8 py-4 text-base font-medium text-white shadow-sm transition-all duration-300 hover:scale-105 hover:bg-gray-800 hover:shadow-lg"
                  >
                    Join Us
                  </Link>
                  <Link
                    href="/create-account"
                    className="inline-flex items-center justify-center rounded-full border-2 border-[#141d22] bg-transparent px-8 py-4 text-base font-medium text-[#141d22] transition-all duration-300 hover:scale-105 hover:bg-gray-100 hover:shadow-md"
                  >
                    Try free demo
                  </Link>
                </div>
              </div>
              <div className="animate-hero-image relative aspect-[4/3] overflow-hidden rounded-2xl shadow-xl">
                <Image
                  src={`${UNSPLASH}/photo-1552664730-d307ca884978?w=800&q=80`}
                  alt="Team collaboration and growth"
                  fill
                  className="object-cover transition-transform duration-500 hover:scale-105"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
            </div>
          </div>
        </section>

        {/* About Us */}
        <AnimateIn as="section" variant="up" className="bg-white px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="mx-auto max-w-7xl">
            <h2 className="text-center text-3xl font-bold text-[#141d22]">About Us</h2>
            <p className="mx-auto mt-8 max-w-3xl text-center text-gray-600 leading-relaxed">
              Founded in 2008, our journey began with a simple mission: to make financial opportunities accessible to everyone. From a small group of passionate traders and developers, we&apos;ve grown into a trusted platform serving thousands worldwide, offering tools for trading, mining, and investing in digital assets.
            </p>

            <div className="mt-16 grid gap-8 md:grid-cols-2">
              <div className="rounded-2xl border border-gray-200 bg-gray-50/50 p-8 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:border-teal-100">
                <h3 className="text-xl font-semibold text-[#141d22]">Mission</h3>
                <p className="mt-4 text-gray-600">
                  To provide innovative, secure, and user-friendly financial tools that empower individuals to achieve financial freedom.
                </p>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-gray-50/50 p-8 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:border-teal-100">
                <h3 className="text-xl font-semibold text-[#141d22]">Vision</h3>
                <p className="mt-4 text-gray-600">
                  A world where anyone, anywhere, can participate in the global economy without barriers.
                </p>
              </div>
            </div>
          </div>
        </AnimateIn>

        {/* What We Offer */}
        <AnimateIn as="section" variant="up" className="bg-gray-50 px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="mx-auto max-w-7xl">
            <h2 className="text-center text-3xl font-bold text-[#141d22]">
              What We Offer (Key Areas of Focus)
            </h2>
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { title: "Advanced Trading Tools", desc: "Trade with precision using cutting-edge technology and analytics.", icon: "📊" },
                { title: "Crypto Mining Solutions", desc: "Earn passive income with efficient and secure mining systems.", icon: "⛏️" },
                { title: "Educational Resources", desc: "Learn, grow, and master your trading skills.", icon: "📚" },
                { title: "24/7 Support", desc: "Your success is our priority.", icon: "🛟" },
              ].map((item, i) => (
                <AnimateIn key={item.title} variant="scale" delay={i < 4 ? (i as 0 | 1 | 2 | 3) : 0}>
                  <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:border-teal-100">
                    <span className="text-2xl" aria-hidden>{item.icon}</span>
                    <h3 className="mt-4 text-lg font-semibold text-[#141d22]">{item.title}</h3>
                    <p className="mt-2 text-sm text-gray-600">{item.desc}</p>
                  </div>
                </AnimateIn>
              ))}
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
