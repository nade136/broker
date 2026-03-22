import Link from "next/link";
import Image from "next/image";
import Header from "./components/Header";
import InsightsCarousel from "./components/InsightsCarousel";
import TestimonialsCarousel from "./components/TestimonialsCarousel";
import AnimateIn from "./components/AnimateIn";

const UNSPLASH = "https://images.unsplash.com";

const stats = [
  { value: "700k+ users", icon: "users" },
  { value: "Duely certified", icon: "certificate" },
  { value: "Multiple regulatory licenses", icon: "license" },
  { value: "24/7 customer support", icon: "support" },
];

const BITREXIFY_ASSETS = "https://bitrexify.com/assets/images";
const markets: {
  title: string;
  description: string;
  href: string;
  image: string;
  useSvgImage?: boolean;
}[] = [
  {
    title: "Forex",
    description:
      "Explore the world's largest financial market by trading major, minor, and exotic currency pairs. Benefit from tight spreads, high leverage, and ultra-fast execution — all on a secure and user-friendly platform designed for both beginners and experienced traders.",
    href: "/forex-trading",
    image: `${BITREXIFY_ASSETS}/forex-phone.svg`,
    useSvgImage: true,
  },
  {
    title: "Stocks",
    description:
      "Trade shares of the world's leading companies like Apple, Tesla, and NVIDIA — all from one powerful platform. Access global stock markets with competitive pricing, real-time data, and seamless execution to capitalize on market movements with confidence.",
    href: "/stocks-trading",
    image: `${BITREXIFY_ASSETS}/stocks-phone.svg`,
    useSvgImage: true,
  },
  {
    title: "Cryptos",
    description:
      "Trade top cryptocurrencies like Bitcoin, Ethereum, and Litecoin with high liquidity, tight spreads, and 24/7 market access. Take advantage of rapid execution and advanced tools on a secure platform built for both beginners and seasoned crypto traders.",
    href: "/crypto-trading",
    image: `${BITREXIFY_ASSETS}/crypto-phone.svg`,
    useSvgImage: true,
  },
];

const whyUs = [
  {
    title: "Tight Spreads & Low Fees",
    description:
      "Trade with ultra-competitive pricing designed to maximize your profit potential.",
    icon: "pricing",
  },
  {
    title: "Lightning-Fast Execution",
    description:
      "Enter and exit trades in milliseconds with our advanced trading infrastructure.",
    icon: "speed",
  },
  {
    title: "24/7 Multi-Asset Access",
    description:
      "Trade forex, stocks, crypto, and commodities anytime — all from one platform.",
    icon: "access",
  },
  {
    title: "Secure & Regulated Platform",
    description:
      "Your funds and data are protected with top-tier security and regulatory standards.",
    icon: "secure",
  },
  {
    title: "Advanced Trading Tools",
    description:
      "Get access to real-time charts, indicators, economic calendars, and more.",
    icon: "charts",
  },
  {
    title: "Dedicated Support",
    description:
      "Our expert support team is available around the clock to help you succeed.",
    icon: "support",
  },
];

const autoTradingImage = `${UNSPLASH}/photo-1552664730-d307ca884978?w=800&q=80`;

function StatIcon({ type }: { type: string }) {
  const cls = "h-8 w-8 text-teal-600";
  switch (type) {
    case "users":
      return (
        <svg
          className={cls}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      );
    case "certificate":
      return (
        <svg
          className={cls}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
          />
        </svg>
      );
    case "license":
      return (
        <svg
          className={cls}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      );
    case "support":
      return (
        <svg
          className={cls}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      );
    default:
      return null;
  }
}

function WhyUsIcon({ type, className }: { type: string; className?: string }) {
  const cls = `h-10 w-10 shrink-0 ${className ?? "text-teal-600"}`;
  switch (type) {
    case "pricing":
      return (
        <svg
          className={cls}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      );
    case "speed":
      return (
        <svg
          className={cls}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
      );
    case "access":
      return (
        <svg
          className={cls}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      );
    case "secure":
      return (
        <svg
          className={cls}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
          />
        </svg>
      );
    case "charts":
      return (
        <svg
          className={cls}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
      );
    case "support":
      return (
        <svg
          className={cls}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      );
    default:
      return null;
  }
}

const autoTradingSteps = [
  {
    title: "Browse automated strategies",
    description: "Explore performance, risk levels, and how each strategy works.",
  },
  {
    title: "Choose your strategy",
    description: "Pick the automation that fits your goals and set your investment amount.",
  },
  {
    title: "Trade automatically",
    description: "Your account follows the automated rules and executes in real time.",
  },
];

const footerQuickLinks = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/about-us" },
  { label: "Contact Us", href: "/contact-us" },
];

const footerMining = [
  { label: "Crypto Mining", href: "/crypto-mining" },
  { label: "Bitcoin Mining", href: "/bitcoin-mining" },
  { label: "Dogecoin Mining", href: "/dogecoin-mining" },
];

const footerLegal = [
  { label: "Terms of Service", href: "/terms-of-services" },
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Cookie Policy", href: "/cookie-policy" },
  { label: "General Risk Disclosure", href: "/general-risk-disclosure" },
  { label: "Responsible Trading", href: "/responsible-trading" },
];

const footerTrading = [
  { label: "Forex Trading", href: "/forex-trading" },
  { label: "Stocks Trading", href: "/stocks-trading" },
  { label: "Options Trading", href: "/options-trading" },
  { label: "Crypto Trading", href: "/crypto-trading" },
  { label: "Auto Trading", href: "/copy-trading" },
];

const footerLearn = [
  { label: "What is Leverage", href: "/what-is-leverage" },
  { label: "What is Spread", href: "/what-is-spread" },
  { label: "What is Margin", href: "/what-is-margin" },
];

const socialLinks = [
  {
    name: "Facebook",
    href: "https://facebook.com",
    icon: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z",
  },
  {
    name: "X",
    href: "https://x.com",
    icon: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z",
  },
  {
    name: "Instagram",
    href: "https://instagram.com",
    icon: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z",
  },
  {
    name: "LinkedIn",
    href: "https://linkedin.com",
    icon: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z",
  },
  {
    name: "YouTube",
    href: "https://youtube.com",
    icon: "M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-[#141d22]">
      <Header />

      <main>
        {/* Hero - Bitrexify: B logo watermark, text sizes and spacing match Bitrexify */}
        <section className="relative overflow-hidden bg-white px-4 pt-16 pb-0 sm:px-6 sm:pt-20 sm:pb-0 lg:px-8 lg:pt-24 lg:pb-0">
          {/* Large faded B logo watermark behind hero (Bitrexify-style) */}
          <div
            className="pointer-events-none absolute inset-0 flex items-center justify-center"
            aria-hidden
          >
            <svg
              viewBox="0 0 64 64"
              className="h-[280px] w-[280px] text-gray-400 opacity-[0.1] sm:h-[360px] sm:w-[360px] lg:h-[440px] lg:w-[440px]"
            >
              <path
                fill="currentColor"
                d="M12 8L12 56C12 56 40 56 40 44C40 32 12 32 12 32C12 32 40 32 40 20C40 8 12 8 12 8Z"
              />
            </svg>
          </div>
          <div className="relative mx-auto max-w-4xl text-center">
            <h1 className="animate-hero-in text-[2rem] font-bold leading-tight tracking-tight text-[#141d22] opacity-0 sm:text-[2.5rem] lg:text-[3rem] xl:text-[3.5rem]">
              Elevate Your Trading
              <br />
              Experience
            </h1>
            <p
              className="animate-hero-in mx-auto mt-5 max-w-xl text-base text-gray-600 opacity-0 sm:text-lg sm:max-w-2xl"
              style={{ animationDelay: "0.05s" }}
            >
              Trade globally with a top-tier broker offering unmatched
              <br />
              market conditions.
            </p>
            <div
              className="animate-hero-in mt-8 flex flex-wrap items-center justify-center gap-3 opacity-0 sm:gap-4 sm:mt-10"
              style={{ animationDelay: "0.1s" }}
            >
              <Link
                href="/create-account"
                className="inline-flex items-center justify-center rounded-lg bg-amber-400 px-6 py-3.5 text-sm font-medium text-black shadow-sm transition hover:bg-amber-500 sm:px-8 sm:py-4 sm:text-base"
              >
                Create Account
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-lg bg-amber-400 px-6 py-3.5 text-sm font-medium text-black shadow-sm transition hover:bg-amber-500 sm:px-8 sm:py-4 sm:text-base"
              >
                Login
              </Link>
            </div>
          </div>
          {/* Full-width stats bar: border touches screen edges (Bitrexify screenshot) */}
          <div
            className="animate-hero-in -mx-4 mt-16 opacity-0 sm:-mx-6 sm:mt-20 lg:-mx-8 lg:mt-24"
            style={{ animationDelay: "0.15s" }}
          >
            <div className="border-y border-gray-200 bg-gray-50/80 py-6">
              <div className="grid grid-cols-2 gap-6 px-4 sm:grid-cols-4 sm:gap-8 sm:px-6 lg:px-8">
                {stats.map((s) => (
                  <div
                    key={s.value}
                    className="flex flex-col items-center gap-2 transition-transform hover:scale-105"
                  >
                    <StatIcon type={s.icon} />
                    <span className="text-center text-sm font-medium text-[#141d22] sm:text-base">
                      {s.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Access All Markets - Bitrexify: dark section flush with stats bar (no gap, per screenshot) */}
        <AnimateIn
          as="section"
          variant="up"
          className="bg-[#1e1e1e] px-4 pt-10 pb-14 sm:px-6 sm:pt-12 lg:px-8 lg:pt-16 lg:pb-20"
        >
          <div className="mx-auto max-w-7xl">
            <h2 className="text-center text-2xl font-bold text-white sm:text-3xl">
              Access All Markets from One Platform
            </h2>
            <div className="mt-10 space-y-12 lg:mt-12 lg:space-y-16">
              {markets.map((m, i) => (
                <AnimateIn
                  key={m.title}
                  variant="up"
                  delay={i < 4 ? (i as 0 | 1 | 2 | 3) : 0}
                >
                  <div className="grid items-center gap-6 lg:grid-cols-2 lg:gap-12">
                    <div className={i % 2 === 1 ? "lg:order-2" : ""}>
                      <h3 className="text-xl font-bold text-white sm:text-2xl">
                        {m.title}
                      </h3>
                      <p className="mt-3 text-sm text-gray-300 sm:mt-4 sm:text-base">
                        {m.description}
                      </p>
                      <Link
                        href={m.href}
                        className="group mt-6 inline-flex items-center text-sm font-medium text-amber-400 transition-all duration-200 hover:gap-2 hover:text-amber-300"
                      >
                        Learn more
                        <svg
                          className="ml-1 h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </Link>
                    </div>
                    <div
                      className={`relative flex min-h-[200px] items-center justify-center ${i % 2 === 1 ? "lg:order-1" : ""} ${m.useSvgImage ? "min-h-[360px] sm:min-h-[420px] lg:min-h-[480px]" : "aspect-video overflow-hidden rounded-xl bg-gray-100"}`}
                    >
                      {m.useSvgImage ? (
                        // eslint-disable-next-line @next/next/no-img-element -- external Bitrexify SVG
                        <img
                          src={m.image}
                          alt={`${m.title} trading - professional platform`}
                          className="h-full w-full max-h-[420px] object-contain object-center sm:max-h-[500px] lg:max-h-[560px]"
                        />
                      ) : (
                        <Image
                          src={m.image}
                          alt={`${m.title} trading - professional platform`}
                          fill
                          className="object-cover"
                          sizes="(max-width: 1024px) 100vw, 50vw"
                        />
                      )}
                    </div>
                  </div>
                </AnimateIn>
              ))}
            </div>
          </div>
        </AnimateIn>

        {/* Why Traders Choose Us - Bitrexify: light section, 6 cards with yellow icons */}
        <AnimateIn
          as="section"
          variant="up"
          className="bg-gray-50 px-4 py-14 sm:px-6 lg:px-8 lg:py-20"
        >
          <div className="mx-auto max-w-7xl">
            <h2 className="text-center text-2xl font-bold text-[#141d22] sm:text-3xl">
              Why Traders Choose Us
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-center text-sm text-gray-600 sm:mt-4 sm:text-base">
              Built for performance, powered by trust — our platform delivers
              everything you need to trade with confidence and success.
            </p>
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:mt-12 lg:grid-cols-3 lg:gap-6">
              {whyUs.map((w, i) => (
                <AnimateIn
                  key={w.title}
                  variant="scale"
                  delay={i < 5 ? (i as 0 | 1 | 2 | 3 | 4) : 0}
                >
                  <div className="flex flex-col rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md lg:p-6">
                    <div className="mb-4 flex justify-center">
                      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-400">
                        <WhyUsIcon
                          type={w.icon}
                          className="h-7 w-7 text-[#141d22]"
                        />
                      </span>
                    </div>
                    <div className="text-center">
                      <h3 className="text-base font-semibold text-[#141d22] sm:text-lg">
                        {w.title}
                      </h3>
                      <p className="mt-1.5 text-sm text-gray-600">
                        {w.description}
                      </p>
                    </div>
                  </div>
                </AnimateIn>
              ))}
            </div>
          </div>
        </AnimateIn>

        {/* Auto trading */}
        <AnimateIn
          as="section"
          variant="up"
          className="bg-black px-4 py-14 sm:px-6 lg:px-8 lg:py-20"
        >
          <div className="mx-auto max-w-7xl">
            <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
              <div className="group relative aspect-video overflow-hidden rounded-xl shadow-lg">
                <Image
                  src={autoTradingImage}
                  alt="Auto trading — automated strategies executing in real time"
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white sm:text-3xl">
                  Automate Your Trading, Earn Like the Pros
                </h2>
                <p className="mt-3 text-sm text-gray-300 sm:mt-4 sm:text-base">
                  Discover a smarter way to trade. Use automated strategies that
                  follow professional rules and execute in real time.
                </p>
                <h3 className="mt-6 text-lg font-semibold text-white sm:mt-8 sm:text-xl">
                  How it works
                </h3>
                <ul className="mt-3 space-y-3 sm:mt-4 sm:space-y-4">
                  {autoTradingSteps.map((step, i) => (
                    <li key={step.title} className="flex gap-3 sm:gap-4">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-400 text-xs font-semibold text-black sm:h-8 sm:w-8 sm:text-sm">
                        {i + 1}
                      </span>
                      <div>
                        <h4 className="text-sm font-medium text-white sm:text-base">
                          {step.title}
                        </h4>
                        <p className="mt-0.5 text-sm text-gray-300">
                          {step.description}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </AnimateIn>

        {/* Insights */}
        <AnimateIn
          as="section"
          variant="up"
          className="bg-gray-50 px-4 py-14 sm:px-6 lg:px-8 lg:py-20"
        >
          <div className="mx-auto max-w-7xl">
            <h2 className="text-center text-2xl font-bold text-[#141d22] sm:text-3xl">
              Insights & Market Updates
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-center text-sm text-gray-600 sm:mt-4 sm:text-base">
              Stay informed with expert analysis, trading tips, and the latest
              financial news from around the world.
            </p>
            <div className="mx-auto mt-10 max-w-2xl sm:mt-12">
              <InsightsCarousel />
            </div>
          </div>
        </AnimateIn>

        {/* CTA */}
        <AnimateIn
          as="section"
          variant="scale"
          className="bg-white px-4 py-14 sm:px-6 lg:px-8 lg:py-20"
        >
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-2xl font-bold text-[#141d22] sm:text-3xl">
              Take Control of Your Financial Future
            </h2>
            <p className="mt-3 text-sm text-gray-600 sm:mt-4 sm:text-base">
              Get access to advanced trading tools, expert strategies, and a
              growing community of successful traders.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:mt-10 sm:gap-4">
              <Link
                href="/create-account"
                className="inline-flex items-center justify-center rounded-lg bg-amber-400 px-6 py-3.5 text-sm font-medium text-black shadow-sm transition hover:bg-amber-500 sm:px-8 sm:py-4 sm:text-base"
              >
                Create Account
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-lg bg-amber-400 px-6 py-3.5 text-sm font-medium text-black shadow-sm transition hover:bg-amber-500 sm:px-8 sm:py-4 sm:text-base"
              >
                Login
              </Link>
            </div>
          </div>
        </AnimateIn>

        {/* Testimonials */}
        <AnimateIn
          as="section"
          variant="up"
          className="bg-gray-50 px-4 py-14 sm:px-6 lg:px-8 lg:py-20"
        >
          <div className="mx-auto max-w-7xl">
            <h2 className="text-center text-2xl font-bold text-[#141d22] sm:text-3xl">
              What our clients say
            </h2>
            <div className="mx-auto mt-10 max-w-3xl sm:mt-12">
              <TestimonialsCarousel />
            </div>
          </div>
        </AnimateIn>

        {/* Footer legal */}
        <section className="border-t border-gray-200 bg-white px-4 py-12 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl space-y-4 text-xs text-gray-500">
            <p>
              Web Ltd is a registered financial technology company operating
              under the Web brand. We specialize in providing online trading
              services and digital financial solutions globally. Web Ltd is
              incorporated under the laws of Saint Vincent and the Grenadines
              with registration number 1313809. Our registered office is located
              in Sydney, Australia.
            </p>
            <p>
              Web (Global) Ltd is a subsidiary entity operating in compliance
              with international financial standards and may be authorized or
              regulated in selected jurisdictions depending on the nature of its
              operations. We are committed to transparency, client protection,
              and ethical trading practices.
            </p>
            <p className="font-medium">
              Risk Warning: Trading leveraged financial instruments such as
              forex, CFDs, and digital assets carries a high level of risk and
              may not be suitable for all investors. You could lose all your
              invested capital. Ensure you fully understand the risks and seek
              independent advice if necessary. Web is not liable for any losses
              or damages arising directly or indirectly from trading activity
              based on information provided on this platform.
            </p>
            <p>
              Our services are not intended for or directed at residents of
              certain jurisdictions, including but not limited to Australia,
              Canada, the United Kingdom, European Union countries, North Korea,
              Iran, and any jurisdictions where such services would be contrary
              to local laws or regulations.
            </p>
            <p>
              The content of this website is for informational purposes only and
              does not constitute investment advice, a recommendation, or an
              offer to buy or sell any financial instrument. By accessing this
              website, you agree that your use of its services is entirely at
              your own risk.
            </p>
            <p>
              All information, graphics, and content on this site are the
              property of Web and may not be copied, reproduced, or distributed
              without written consent.
            </p>
            <p>
              Web complies with global data security standards, including the
              Payment Card Industry Data Security Standard (PCI DSS), to protect
              your information. Regular security audits and penetration tests
              are performed to ensure the safety of user data.
            </p>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-gray-200 bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-col items-center gap-6 lg:flex-row lg:items-start lg:justify-between">
              <Link href="/" className="text-xl font-bold text-[#141d22]">
                Web
              </Link>
              <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-5">
                <div>
                  <h3 className="text-sm font-semibold text-[#141d22]">
                    Quick Links
                  </h3>
                  <ul className="mt-3 space-y-2">
                    {footerQuickLinks.map((l) => (
                      <li key={l.href}>
                        <Link
                          href={l.href}
                          className="text-sm text-gray-600 hover:text-teal-600"
                        >
                          {l.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[#141d22]">
                    Mining
                  </h3>
                  <ul className="mt-3 space-y-2">
                    {footerMining.map((l) => (
                      <li key={l.href}>
                        <Link
                          href={l.href}
                          className="text-sm text-gray-600 hover:text-teal-600"
                        >
                          {l.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[#141d22]">
                    Legal & Policy
                  </h3>
                  <ul className="mt-3 space-y-2">
                    {footerLegal.map((l) => (
                      <li key={l.href}>
                        <Link
                          href={l.href}
                          className="text-sm text-gray-600 hover:text-teal-600"
                        >
                          {l.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[#141d22]">
                    Trading
                  </h3>
                  <ul className="mt-3 space-y-2">
                    {footerTrading.map((l) => (
                      <li key={l.href}>
                        <Link
                          href={l.href}
                          className="text-sm text-gray-600 hover:text-teal-600"
                        >
                          {l.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[#141d22]">
                    Learn
                  </h3>
                  <ul className="mt-3 space-y-2">
                    {footerLearn.map((l) => (
                      <li key={l.href}>
                        <Link
                          href={l.href}
                          className="text-sm text-gray-600 hover:text-teal-600"
                        >
                          {l.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
            <div className="mt-10 flex flex-col items-center gap-6 border-t border-gray-200 pt-10 sm:flex-row sm:justify-between">
              <div className="flex gap-4">
                {socialLinks.map((s) => (
                  <a
                    key={s.name}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-500 hover:text-teal-600 transition-colors"
                    aria-label={s.name}
                  >
                    <svg
                      className="h-5 w-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d={s.icon} />
                    </svg>
                  </a>
                ))}
              </div>
              <p className="text-sm text-gray-500">
                Copyright © 2026 | Web.com
              </p>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
