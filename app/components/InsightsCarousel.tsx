"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

const UNSPLASH = "https://images.unsplash.com";

const slides = [
  { title: "Best spreads on gold, oil, and BTC", tag: "Product", href: "#", image: `${UNSPLASH}/photo-1611974789855-9c2a0a7236a3?w=800&q=80` },
  { title: "Nature vs. nurture: Born to trade or trained to trade?", tag: "Community", href: "#", image: `${UNSPLASH}/photo-1642790106117-e829e14a795f?w=800&q=80` },
  { title: "An easy guide to unlocking extra income with the Web Affiliate Program", tag: "Community", href: "#", image: `${UNSPLASH}/photo-1552664730-d307ca884978?w=800&q=80` },
  { title: "Review guide: how to know your broker is trusted and also good", tag: "Integrity", href: "#", image: `${UNSPLASH}/photo-1639762681485-074b7f938ba0?w=800&q=80` },
];

export default function InsightsCarousel() {
  const [active, setActive] = useState(0);

  return (
    <div className="w-full">
      <div className="relative min-h-[280px] overflow-hidden">
        {slides.map((slide, i) => (
          <div
            key={i}
            className={`absolute inset-0 transition-opacity duration-500 ${
              i === active ? "relative z-10 opacity-100" : "z-0 opacity-0 pointer-events-none"
            }`}
          >
            <Link
              href={slide.href}
              className="group block overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:shadow-lg"
            >
              <div className="relative aspect-[2/1] w-full overflow-hidden bg-gray-100">
                <Image
                  src={slide.image}
                  alt=""
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 1024px) 100vw, 800px"
                />
              </div>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-[#141d22]">{slide.title}</h3>
                <p className="mt-1 text-sm text-teal-600">{slide.tag}</p>
              </div>
            </Link>
          </div>
        ))}
      </div>
      <div className="mt-4 flex justify-center gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setActive(i)}
            className={`h-2 rounded-full transition-all duration-300 hover:scale-110 ${
              i === active ? "w-8 bg-teal-600" : "w-2 bg-gray-300 hover:bg-gray-400"
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
