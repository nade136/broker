"use client";

import Link from "next/link";
import { useState } from "react";

const tradingLinks = [
  { label: "Forex Trading", href: "/forex-trading" },
  { label: "Stocks Trading", href: "/stocks-trading" },
  { label: "Options Trading", href: "/options-trading" },
  { label: "Crypto Trading", href: "/crypto-trading" },
  { label: "Auto Trading", href: "/copy-trading" },
];

const miningLinks = [
  { label: "Crypto Mining", href: "/crypto-mining" },
  { label: "Bitcoin Mining", href: "/bitcoin-mining" },
  { label: "Dogecoin Mining", href: "/dogecoin-mining" },
];

const learnLinks = [
  { label: "What is Leverage", href: "/what-is-leverage" },
  { label: "What is Spread", href: "/what-is-spread" },
  { label: "What is Margin", href: "/what-is-margin" },
];

function Dropdown({
  label,
  links,
  open,
  onToggle,
}: {
  label: string;
  links: { label: string; href: string }[];
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="relative">
      <button
        type="button"
        onClick={onToggle}
        className="flex items-center gap-1 px-3 py-2 text-[#141d22] hover:text-teal-600 transition-colors"
      >
        {label}
        <svg
          className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="animate-mount-in absolute top-full left-0 mt-0 min-w-[200px] origin-top-left rounded-lg border border-gray-200 bg-white py-2 shadow-lg z-50">
          {links.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block px-4 py-2 text-sm text-[#141d22] hover:bg-gray-50 hover:text-teal-600"
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Header() {
  const [tradingOpen, setTradingOpen] = useState(false);
  const [miningOpen, setMiningOpen] = useState(false);
  const [learnOpen, setLearnOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-100 bg-white">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold text-[#141d22]">Web</span>
        </Link>

        <div className="hidden md:flex md:items-center md:gap-1">
          <Link
            href="/"
            className="px-3 py-2 text-[#141d22] hover:text-teal-600 transition-colors"
          >
            Home
          </Link>
          <Link
            href="/about-us"
            className="px-3 py-2 text-[#141d22] hover:text-teal-600 transition-colors"
          >
            About Us
          </Link>
          <Link
            href="/contact-us"
            className="px-3 py-2 text-[#141d22] hover:text-teal-600 transition-colors"
          >
            Contact Us
          </Link>
          <Dropdown
            label="Trading"
            links={tradingLinks}
            open={tradingOpen}
            onToggle={() => {
              setTradingOpen(!tradingOpen);
              setMiningOpen(false);
              setLearnOpen(false);
            }}
          />
          <Dropdown
            label="Mining"
            links={miningLinks}
            open={miningOpen}
            onToggle={() => {
              setMiningOpen(!miningOpen);
              setTradingOpen(false);
              setLearnOpen(false);
            }}
          />
          <Dropdown
            label="Learn"
            links={learnLinks}
            open={learnOpen}
            onToggle={() => {
              setLearnOpen(!learnOpen);
              setTradingOpen(false);
              setMiningOpen(false);
            }}
          />
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/create-account"
            className="hidden sm:inline-flex items-center justify-center rounded-full bg-[#141d22] px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-800 transition-colors"
          >
            Register
          </Link>
          <Link
            href="/login"
            className="hidden sm:inline-flex items-center justify-center rounded-full border border-[#141d22] px-5 py-2.5 text-sm font-medium text-[#141d22] hover:bg-gray-50 transition-colors"
          >
            Login
          </Link>
          <button
            type="button"
            className="md:hidden p-2 text-[#141d22]"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </nav>

      {mobileMenuOpen && (
        <div className="border-t border-gray-100 bg-white px-4 py-4 md:hidden">
          <div className="flex flex-col gap-2">
            <Link href="/" className="py-2 text-[#141d22]" onClick={() => setMobileMenuOpen(false)}>Home</Link>
            <Link href="/about-us" className="py-2 text-[#141d22]" onClick={() => setMobileMenuOpen(false)}>About Us</Link>
            <Link href="/contact-us" className="py-2 text-[#141d22]" onClick={() => setMobileMenuOpen(false)}>Contact Us</Link>
            <span className="py-2 text-gray-500 font-medium">Trading</span>
            {tradingLinks.map((l) => (
              <Link key={l.href} href={l.href} className="pl-4 py-1 text-[#141d22]" onClick={() => setMobileMenuOpen(false)}>{l.label}</Link>
            ))}
            <span className="py-2 text-gray-500 font-medium">Mining</span>
            {miningLinks.map((l) => (
              <Link key={l.href} href={l.href} className="pl-4 py-1 text-[#141d22]" onClick={() => setMobileMenuOpen(false)}>{l.label}</Link>
            ))}
            <span className="py-2 text-gray-500 font-medium">Learn</span>
            {learnLinks.map((l) => (
              <Link key={l.href} href={l.href} className="pl-4 py-1 text-[#141d22]" onClick={() => setMobileMenuOpen(false)}>{l.label}</Link>
            ))}
            <Link href="/create-account" className="mt-2 rounded-full bg-[#141d22] py-2.5 text-center text-white" onClick={() => setMobileMenuOpen(false)}>Register</Link>
            <Link href="/login" className="rounded-full border border-[#141d22] py-2.5 text-center text-[#141d22]" onClick={() => setMobileMenuOpen(false)}>Login</Link>
          </div>
        </div>
      )}
    </header>
  );
}
