import Link from "next/link";

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
  { name: "Facebook", href: "https://facebook.com", icon: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" },
  { name: "X", href: "https://x.com", icon: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" },
  { name: "Instagram", href: "https://instagram.com", icon: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" },
  { name: "LinkedIn", href: "https://linkedin.com", icon: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" },
  { name: "YouTube", href: "https://youtube.com", icon: "M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" },
];

export default function Footer() {
  return (
    <>
      <section className="border-t border-gray-200 bg-white px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-4 text-xs text-gray-500">
          <p>
            Web Ltd is a registered financial technology company operating under the Web brand. We specialize in providing online trading services and digital financial solutions globally. Web Ltd is incorporated under the laws of Saint Vincent and the Grenadines with registration number 1313809. Our registered office is located in Sydney, Australia.
          </p>
          <p>
            Web (Global) Ltd is a subsidiary entity operating in compliance with international financial standards and may be authorized or regulated in selected jurisdictions depending on the nature of its operations. We are committed to transparency, client protection, and ethical trading practices.
          </p>
          <p className="font-medium">
            Risk Warning: Trading leveraged financial instruments such as forex, CFDs, and digital assets carries a high level of risk and may not be suitable for all investors. You could lose all your invested capital. Ensure you fully understand the risks and seek independent advice if necessary. Web is not liable for any losses or damages arising directly or indirectly from trading activity based on information provided on this platform.
          </p>
          <p>
            Our services are not intended for or directed at residents of certain jurisdictions, including but not limited to Australia, Canada, the United Kingdom, European Union countries, North Korea, Iran, and any jurisdictions where such services would be contrary to local laws or regulations.
          </p>
          <p>
            The content of this website is for informational purposes only and does not constitute investment advice, a recommendation, or an offer to buy or sell any financial instrument. By accessing this website, you agree that your use of its services is entirely at your own risk.
          </p>
          <p>
            All information, graphics, and content on this site are the property of Web and may not be copied, reproduced, or distributed without written consent.
          </p>
          <p>
            Web complies with global data security standards, including the Payment Card Industry Data Security Standard (PCI DSS), to protect your information. Regular security audits and penetration tests are performed to ensure the safety of user data.
          </p>
        </div>
      </section>
      <footer className="border-t border-gray-200 bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col items-center gap-6 lg:flex-row lg:items-start lg:justify-between">
            <Link href="/" className="text-xl font-bold text-[#141d22]">
              Web
            </Link>
            <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-5">
              <div>
                <h3 className="text-sm font-semibold text-[#141d22]">Quick Links</h3>
                <ul className="mt-3 space-y-2">
                  {footerQuickLinks.map((l) => (
                    <li key={l.href}>
                      <Link href={l.href} className="text-sm text-gray-600 hover:text-teal-600">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[#141d22]">Mining</h3>
                <ul className="mt-3 space-y-2">
                  {footerMining.map((l) => (
                    <li key={l.href}>
                      <Link href={l.href} className="text-sm text-gray-600 hover:text-teal-600">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[#141d22]">Legal & Policy</h3>
                <ul className="mt-3 space-y-2">
                  {footerLegal.map((l) => (
                    <li key={l.href}>
                      <Link href={l.href} className="text-sm text-gray-600 hover:text-teal-600">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[#141d22]">Trading</h3>
                <ul className="mt-3 space-y-2">
                  {footerTrading.map((l) => (
                    <li key={l.href}>
                      <Link href={l.href} className="text-sm text-gray-600 hover:text-teal-600">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[#141d22]">Learn</h3>
                <ul className="mt-3 space-y-2">
                  {footerLearn.map((l) => (
                    <li key={l.href}>
                      <Link href={l.href} className="text-sm text-gray-600 hover:text-teal-600">
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
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d={s.icon} />
                  </svg>
                </a>
              ))}
            </div>
            <p className="text-sm text-gray-500">Copyright © 2026 | Web.com</p>
          </div>
        </div>
      </footer>
    </>
  );
}
