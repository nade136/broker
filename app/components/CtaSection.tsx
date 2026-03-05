import Link from "next/link";

export default function CtaSection() {
  return (
    <section className="bg-white px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="text-3xl font-bold text-[#141d22]">
          Take Control of Your Financial Future
        </h2>
        <p className="mt-4 text-gray-600">
          Get access to advanced trading tools, expert strategies, and a growing community of successful traders.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/create-account"
            className="inline-flex items-center justify-center rounded-full bg-[#141d22] px-8 py-4 text-base font-medium text-white shadow-sm transition-all duration-300 hover:scale-105 hover:bg-gray-800 hover:shadow-lg"
          >
            Create Account
          </Link>
          <Link
            href="/create-account"
            className="inline-flex items-center justify-center rounded-full border-2 border-[#141d22] bg-transparent px-8 py-4 text-base font-medium text-[#141d22] transition-all duration-300 hover:scale-105 hover:bg-gray-100 hover:shadow-md"
          >
            Try free demo
          </Link>
        </div>
      </div>
    </section>
  );
}
