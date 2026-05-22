import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function CTA() {
  return (
    <section className="container-x py-16">
      <div className="relative overflow-hidden rounded-[2rem] bg-mango-gradient p-10 sm:p-14 text-center shadow-glow">
        <div className="absolute -top-10 -left-10 text-9xl opacity-20">🥭</div>
        <div className="absolute -bottom-10 -right-10 text-9xl opacity-20">
          🥭
        </div>
        <h2 className="relative font-display-bn text-3xl sm:text-4xl md:text-5xl font-bold text-ink leading-tight">
          আমের মৌসুম মিস করবেন না!
        </h2>
        <p className="relative mt-3 text-ink/80 max-w-xl mx-auto">
          সীমিত স্টক — চাঁপাইনবাবগঞ্জের গাছপাকা ঐতিহ্যবাহী আম, মে থেকে আগস্ট।
        </p>
        <Link
          href="/products"
          className="relative mt-7 inline-flex items-center gap-2 rounded-full bg-ink px-7 py-3.5 text-sm font-bold text-cream hover:scale-105 transition shadow-soft"
        >
          এখনই অর্ডার করুন <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
