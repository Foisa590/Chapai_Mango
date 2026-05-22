"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Award, Sparkles } from "lucide-react";

const Scene = dynamic(() => import("@/components/3d/Scene"), {
  ssr: false,
  loading: () => (
    <div className="grid place-items-center h-full">
      <div className="text-7xl animate-float">🥭</div>
    </div>
  )
});

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-hero-radial">
      {/* decorative blobs */}
      <div className="absolute -top-20 -left-20 h-80 w-80 rounded-full bg-mango-300/40 blur-3xl" />
      <div className="absolute top-40 -right-32 h-96 w-96 rounded-full bg-leaf-400/30 blur-3xl" />

      <div className="container-x relative grid lg:grid-cols-2 gap-10 items-center py-16 lg:py-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center lg:text-left"
        >
          <span className="inline-flex items-center gap-2 rounded-full glass px-4 py-2 text-xs font-semibold text-mango-700 mb-6">
            <Sparkles className="h-3.5 w-3.5" />
            GI-ট্যাগ পাওয়া ক্ষীরসাপাত পাওয়া যাচ্ছে
          </span>

          <h1 className="font-display-bn text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold leading-[1.15] text-ink">
            <span className="shimmer-text">চাঁপাইনবাবগঞ্জের</span> বাগান থেকে{" "}
            <br className="hidden sm:block" />
            সরাসরি আপনার দরজায়
          </h1>

          <p className="mt-6 text-base sm:text-lg text-ink/70 max-w-xl mx-auto lg:mx-0 leading-relaxed">
            গাছপাকা, কেমিক্যাল-মুক্ত, হাতে বাছাই করা আম — হিমসাগর, ল্যাংড়া,
            ক্ষীরসাপাত, ফজলি, আম্রপালি, গোপালভোগ। ঐতিহ্যবাহী জাত থেকে হাইব্রিড,
            সবকিছু এক জায়গায়।
          </p>

          <div className="mt-8 flex flex-wrap justify-center lg:justify-start gap-4">
            <Link href="/products" className="btn-primary">
              এখনই অর্ডার করুন <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/about" className="btn-ghost">
              আমাদের গল্প
            </Link>
          </div>

          <div className="mt-10 grid grid-cols-3 gap-4 max-w-lg mx-auto lg:mx-0">
            <Stat
              icon={<Award className="h-5 w-5" />}
              value="৬+"
              label="আমের জাত"
            />
            <Stat value="১০০%" label="কেমিক্যাল-মুক্ত" />
            <Stat value="৬৪" label="জেলায় ডেলিভারি" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.2 }}
          className="relative h-[400px] sm:h-[500px] lg:h-[560px]"
        >
          {/* glow ring */}
          <div className="absolute inset-10 rounded-full bg-mango-gradient blur-3xl opacity-50 animate-pulse" />
          <div className="relative h-full">
            <Scene />
          </div>
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 glass rounded-full px-5 py-2 text-xs font-medium text-ink/80 whitespace-nowrap">
            ঘোরাতে ড্র্যাগ করুন · ১০০% গাছপাকা
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function Stat({
  icon,
  value,
  label
}: {
  icon?: React.ReactNode;
  value: string;
  label: string;
}) {
  return (
    <div className="glass rounded-2xl p-3 sm:p-4 text-center">
      {icon && <div className="mx-auto mb-1 text-mango-600">{icon}</div>}
      <div className="font-display-bn text-xl sm:text-2xl font-bold text-mango-700">
        {value}
      </div>
      <div className="text-[11px] sm:text-xs text-ink/60">{label}</div>
    </div>
  );
}
