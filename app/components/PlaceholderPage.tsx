import Link from "next/link";
import Header from "./Header";
import Footer from "./Footer";
import AnimateIn from "./AnimateIn";

type Props = {
  title: string;
  description?: string;
};

export default function PlaceholderPage({ title, description }: Props) {
  return (
    <div className="min-h-screen bg-white text-[#141d22]">
      <Header />
      <main className="flex min-h-[50vh] flex-col items-center justify-center px-4 py-24">
        <AnimateIn variant="up" className="flex flex-col items-center text-center">
          <h1 className="text-3xl font-bold text-[#141d22]">{title}</h1>
          {description && (
            <p className="mt-4 max-w-lg text-center text-gray-600">{description}</p>
          )}
          <p className="mt-6 text-sm text-gray-500">This page is coming soon.</p>
          <Link
            href="/"
            className="mt-8 inline-flex items-center justify-center rounded-full bg-[#141d22] px-6 py-3 text-sm font-medium text-white transition-all duration-300 hover:scale-105 hover:bg-gray-800 hover:shadow-md"
          >
            Back to home
          </Link>
        </AnimateIn>
      </main>
      <Footer />
    </div>
  );
}
