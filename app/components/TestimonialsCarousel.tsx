"use client";

import { useState, useEffect } from "react";

const testimonials = [
  { quote: "I started with a demo account just to test the waters, and once I moved to live trading, the experience was seamless. I've made solid profits trading both crypto and forex pairs. The platform is fast, transparent, and has truly boosted my confidence as an investor", name: "David Afolabi" },
  { quote: "As a beginner, auto trading was a lifesaver for me. I used automated strategies while learning at my own pace. Now I actively trade stocks as well, and my portfolio has grown far beyond my expectations. It feels good to finally have a broker I can trust.", name: "Sophia Martinez" },
  { quote: "What I love most is the variety. I can mine crypto while still trading global indices, all in one place. I started with a small deposit and in just a few months, I've seen impressive returns. The demo account gave me the confidence to go live without fear.", name: "Michael Chen" },
  { quote: "This platform is the complete package—crypto, forex, stocks, indices, and even auto trading. I diversified my trades easily and saw consistent profits. The support team is also fantastic, always ready to assist. I've recommended it to my friends already!", name: "Grace Thompson" },
  { quote: "I've traded forex for years, but adding indices on this platform gave me new profit opportunities. The charts are accurate, execution is instant, and I've never had issues with withdrawals. Finally, a broker that delivers exactly what it promises.", name: "Ahmed Suleiman" },
  { quote: "I was skeptical at first, so I practiced on the demo account. After gaining confidence, I switched to a live account, and the results have been incredible. The tools and resources available made me feel like a professional trader from day one.", name: "Emily Roberts" },
  { quote: "The auto trading feature is genius. I started with zero trading knowledge, but using automated strategies on the platform, I've already doubled my initial investment. It's hands down the best decision I've made financially this year.", name: "Carlos Mendoza" },
  { quote: "I combined mining with crypto trading, and it has been a game-changer for me. The profits keep growing steadily, and I love that I can manage everything from one platform. It feels like I'm finally in control of my financial future.", name: "Hannah Williams" },
];

function StarRating() {
  return (
    <div className="flex gap-0.5 text-amber-400">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export default function TestimonialsCarousel() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setActive((a) => (a + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="w-full">
      <div className="relative min-h-[240px] overflow-hidden">
        {testimonials.map((t, i) => (
          <div
            key={i}
            className={`absolute inset-0 transition-opacity duration-500 ${
              i === active ? "relative z-10 opacity-100" : "z-0 opacity-0 pointer-events-none"
            }`}
          >
            <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
              <StarRating />
              <p className="mt-4 text-[#141d22] leading-relaxed">{t.quote}</p>
              <p className="mt-4 font-semibold text-[#141d22]">{t.name}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6 flex justify-center gap-2">
        {testimonials.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setActive(i)}
            className={`h-2 rounded-full transition-all duration-300 hover:scale-110 ${
              i === active ? "w-8 bg-teal-600" : "w-2 bg-gray-300 hover:bg-gray-400"
            }`}
            aria-label={`Go to testimonial ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
