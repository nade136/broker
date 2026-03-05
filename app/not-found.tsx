import Link from "next/link";
import Header from "./components/Header";
import Footer from "./components/Footer";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white text-[#141d22]">
      <Header />
      <main className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-16">
        <div className="animate-hero-in flex flex-col items-center text-center opacity-0">
          <h1 className="text-6xl font-bold text-gray-200">404</h1>
          <h2 className="mt-4 text-2xl font-semibold text-[#141d22]">Page not found</h2>
          <p className="mt-2 max-w-md text-center text-gray-600">
          The page you’re looking for doesn’t exist or has been moved.
          </p>
          <Link
            href="/"
            className="mt-8 inline-flex items-center justify-center rounded-full bg-[#141d22] px-8 py-3.5 text-base font-medium text-white transition-all duration-300 hover:scale-105 hover:bg-gray-800 hover:shadow-lg"
        >
          Back to home
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
