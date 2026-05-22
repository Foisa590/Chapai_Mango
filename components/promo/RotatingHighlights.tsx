"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Award, Leaf, MapPin, Truck, type LucideIcon } from "lucide-react";

/**
 * Big, premium hero strip that auto-rotates through a small set of
 * marquee-quality promotional messages. Used in the middle of the
 * home page (between Hero and FeaturedMangoes).
 *
 * - Auto-rotates every 3.8s.
 * - AnimatePresence does the polished slide-up + fade between cards.
 * - Indicator pill fills like a progress bar so customers know
 *   another message is on the way.
 * - Click an indicator dot to jump to that highlight (and pauses the
 *   auto-rotate briefly so the user can read).
 */

type Highlight = {
  icon: LucideIcon;
  title: string;
  sub: string;
};

const HIGHLIGHTS: Highlight[] = [
  {
    icon: Truck,
    title: "সারাদেশে ফ্রী ডেলিভারি",
    sub: "৬৪ জেলায় ২৪–৭২ ঘণ্টায় হোম ডেলিভারি"
  },
  {
    icon: Award,
    title: "চাঁপাইনবাবগঞ্জের প্রিমিয়াম আম",
    sub: "GI ট্যাগ পাওয়া ক্ষীরসাপাত · ঐতিহ্যবাহী হিমসাগর"
  },
  {
    icon: Leaf,
    title: "১০০% গাছপাকা, কেমিক্যাল-মুক্ত",
    sub: "তিন প্রজন্মের ঐতিহ্য, খাঁটি বাংলা আম"
  },
  {
    icon: MapPin,
    title: "সরাসরি বাগান থেকে আপনার দরজায়",
    sub: "নিজামপুর, নাচোল, চাঁপাইনবাবগঞ্জ"
  }
];

const ROTATE_MS = 3800;

export default function RotatingHighlights() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(
      () => setIndex((i) => (i + 1) % HIGHLIGHTS.length),
      ROTATE_MS
    );
    return () => clearInterval(id);
  }, [paused]);

  const current = HIGHLIGHTS[index];
  const Icon = current.icon;

  return (
    <section className="container-x py-10 sm:py-12">
      <div
        className="relative overflow-hidden rounded-[2rem] p-[2px] bg-mango-gradient shadow-glow"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div className="relative bg-cream/95 backdrop-blur-md rounded-[1.92rem] px-5 py-8 sm:px-10 sm:py-10 overflow-hidden">
          {/* Decorative blobs */}
          <div className="absolute -top-16 -right-16 h-48 w-48 rounded-full bg-mango-300/40 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-leaf-400/30 blur-3xl pointer-events-none" />

          {/* Slot for the rotating card */}
          <div className="relative min-h-[88px] sm:min-h-[96px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 24, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -24, scale: 0.96 }}
                transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0 flex items-center gap-4 sm:gap-6"
              >
                <div className="grid place-items-center h-14 w-14 sm:h-16 sm:w-16 rounded-2xl bg-mango-gradient text-ink shadow-glow shrink-0">
                  <Icon className="h-7 w-7 sm:h-8 sm:w-8" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-display-bn text-xl sm:text-2xl md:text-3xl font-bold text-ink leading-tight">
                    {current.title}
                  </h3>
                  <p className="text-sm sm:text-base text-ink/65 mt-1.5 leading-snug">
                    {current.sub}
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Indicators */}
          <div className="flex justify-center gap-2 mt-7">
            {HIGHLIGHTS.map((h, i) => (
              <button
                key={i}
                onClick={() => {
                  setIndex(i);
                  setPaused(true);
                  // Resume after a beat so users can keep clicking through
                  setTimeout(() => setPaused(false), 5000);
                }}
                aria-label={h.title}
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  i === index
                    ? "w-10 bg-mango-600"
                    : "w-1.5 bg-mango-300 hover:bg-mango-400"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
