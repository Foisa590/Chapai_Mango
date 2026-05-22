import Image from "next/image";
import Link from "next/link";
import { Award, Leaf, Users, TreePine } from "lucide-react";

export const metadata = {
  title: "About — Chapai Mango",
  description:
    "Chapainawabganj-er aam-er heritage, amader bagan, ar amader story."
};

const TIMELINE = [
  {
    year: "1985",
    title: "Family bagan-er shuru",
    desc: "Dada-bhai Chapainawabganj-e prothom 50-ti aam gach lagan."
  },
  {
    year: "2010",
    title: "Organic chash-er por shoba",
    desc: "Chemical-mukto chash-e bishesh focus — kitnashok bondho."
  },
  {
    year: "2018",
    title: "Khirsapat-er GI tag",
    desc: "Chapai Khirsapat Geographical Indication-e nibondhito holo."
  },
  {
    year: "2024",
    title: "Online launch",
    desc: "Chapai Mango — sara Bangladesh-e doorstep delivery shuru."
  }
];

const STATS = [
  { icon: TreePine, value: "500+", label: "Aam gach" },
  { icon: Leaf, value: "0%", label: "Chemical use" },
  { icon: Users, value: "12K+", label: "Khushi customer" },
  { icon: Award, value: "GI", label: "Tag certified" }
];

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-hero-radial">
        <div className="container-x py-16 lg:py-24 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-sm font-semibold text-mango-600 mb-2">━ Amader Story</p>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
              Tin <span className="shimmer-text">prajonmer</span> bagan, <br />
              ek-tai promise — <br />
              <span className="text-mango-700">khati aam.</span>
            </h1>
            <p className="mt-6 text-ink/70 text-lg leading-relaxed max-w-xl">
              Chapainawabganj — Bangladesh-er aam-er rajdhani. Amader poribar
              1985 sal theke ekhane aam chash kore. Aj amra sei heritage-ke
              online niye ashchi, jate apnara o gachpaka, chemical-mukto
              Chapai-er aam pete paren.
            </p>
          </div>
          <div className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-soft">
            <Image
              src="https://images.unsplash.com/photo-1591073113125-e46713c829ed?w=1200"
              alt="Chapai mango bagan"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/40 via-transparent" />
            <div className="absolute bottom-5 left-5 right-5 glass rounded-2xl p-4">
              <div className="text-xs uppercase tracking-widest text-mango-700 font-semibold">
                Bagan
              </div>
              <div className="font-display text-lg font-bold">
                Chapainawabganj, Rajshahi
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="container-x py-16">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {STATS.map((s) => (
            <div key={s.label} className="glass rounded-3xl p-6 text-center">
              <div className="inline-grid place-items-center h-12 w-12 rounded-2xl bg-mango-gradient mb-3">
                <s.icon className="h-6 w-6 text-ink" />
              </div>
              <div className="font-display text-3xl font-bold text-mango-700">
                {s.value}
              </div>
              <div className="text-sm text-ink/60 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Timeline */}
      <section className="container-x py-16">
        <div className="text-center mb-12 max-w-2xl mx-auto">
          <p className="text-sm font-semibold text-mango-600 mb-2">━ Journey</p>
          <h2 className="section-title">
            Amader <span className="shimmer-text">jatra</span>
          </h2>
        </div>
        <div className="relative">
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-mango-300" />
          <div className="space-y-10 md:space-y-16">
            {TIMELINE.map((t, i) => (
              <div
                key={t.year}
                className={`md:grid md:grid-cols-2 md:gap-10 items-center ${
                  i % 2 === 0 ? "" : "md:[direction:rtl]"
                }`}
              >
                <div className="md:[direction:ltr]">
                  <div className="glass rounded-3xl p-6 md:p-8 relative">
                    <div className="font-display text-3xl font-bold text-mango-600 mb-1">
                      {t.year}
                    </div>
                    <h3 className="font-display text-xl font-bold mb-2">
                      {t.title}
                    </h3>
                    <p className="text-ink/70">{t.desc}</p>
                  </div>
                </div>
                <div className="hidden md:block" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Promise */}
      <section className="container-x pb-16">
        <div className="relative overflow-hidden rounded-[2rem] bg-mango-gradient p-10 sm:p-14 text-center">
          <div className="absolute -top-10 -left-10 text-9xl opacity-15">🥭</div>
          <div className="absolute -bottom-10 -right-10 text-9xl opacity-15">🌿</div>
          <h2 className="relative font-display text-3xl sm:text-4xl font-bold text-ink max-w-2xl mx-auto">
            Amader promise — apnar parivar-er jonno khati Chapai-er aam, prothom
            din theke shesh din.
          </h2>
          <Link href="/products" className="relative mt-6 inline-flex btn-ghost bg-white/40">
            Shop dekhun
          </Link>
        </div>
      </section>
    </>
  );
}
