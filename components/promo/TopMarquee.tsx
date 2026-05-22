"use client";

import { Sparkles } from "lucide-react";

/**
 * Single-line scrolling promo strip that sits ABOVE the navbar on
 * every public page. Plain CSS marquee animation (defined in
 * globals.css) — no JS scroll math, no jank, infinite seamless loop.
 *
 * Hover (or tap-and-hold on mobile) pauses the scroll so customers
 * can read a specific message.
 */
const PROMO_MESSAGES = [
  { text: "সারাদেশে ফ্রী ডেলিভারি", emoji: "🚚" },
  { text: "চাঁপাইনবাবগঞ্জের প্রিমিয়াম আম", emoji: "🥭" },
  { text: "১০০% গাছপাকা, কেমিক্যাল-মুক্ত", emoji: "✨" },
  { text: "ন্যূনতম অর্ডার ১০ কেজি", emoji: "📦" },
  { text: "GI ট্যাগ পাওয়া ক্ষীরসাপাত", emoji: "🏆" },
  { text: "সরাসরি বাগান থেকে আপনার দরজায়", emoji: "🏡" }
];

export default function TopMarquee() {
  // Duplicate the list so the CSS keyframe (translateX 0 → -50%)
  // produces a seamless loop without a visible reset.
  const items = [...PROMO_MESSAGES, ...PROMO_MESSAGES];

  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-mango-700 via-mango-600 to-mango-700 text-cream border-b border-mango-800/30">
      <Sparkles className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-mango-200 z-10 hidden sm:block animate-pulse" />
      <div
        className="marquee-track flex whitespace-nowrap py-2 hover:[animation-play-state:paused]"
        aria-label="বিশেষ বার্তা"
      >
        {items.map((item, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-2 px-5 sm:px-7 text-xs sm:text-sm font-semibold tracking-wide"
          >
            <span aria-hidden className="text-base">
              {item.emoji}
            </span>
            <span>{item.text}</span>
            <span className="text-mango-300/80 font-bold ml-3">·</span>
          </span>
        ))}
      </div>
    </div>
  );
}
