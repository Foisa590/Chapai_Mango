"use client";

import { motion } from "framer-motion";
import {
  Leaf,
  PackageCheck,
  Sprout,
  ShieldCheck,
  Truck,
  Heart
} from "lucide-react";

const FEATURES = [
  {
    icon: Leaf,
    title: "100% Chemical-free",
    desc: "No carbide, no formalin. Pure gachpaka aam."
  },
  {
    icon: Sprout,
    title: "Direct from Farm",
    desc: "Chapainawabganj-er bagan theke shoja apnar bashai."
  },
  {
    icon: PackageCheck,
    title: "Safe Packaging",
    desc: "Special foam-padded carton — ekta o nosto hobe na."
  },
  {
    icon: Truck,
    title: "Fast Delivery",
    desc: "24-72 ghonta, 64 district-e doorstep delivery."
  },
  {
    icon: ShieldCheck,
    title: "Quality Guarantee",
    desc: "Khoraber khobor pele 100% replacement / refund."
  },
  {
    icon: Heart,
    title: "Heritage Varieties",
    desc: "GI-tagged Khirsapat, original Himsagar, Langra."
  }
];

export default function WhyChooseUs() {
  return (
    <section className="bg-gradient-to-b from-cream via-mango-50 to-cream py-20 sm:py-24">
      <div className="container-x">
        <div className="text-center mb-12 max-w-2xl mx-auto">
          <p className="text-sm font-semibold text-mango-600 mb-2">
            ━ Keno Chapai Mango?
          </p>
          <h2 className="section-title">
            Aam noy, <span className="shimmer-text">bishwas</span> deliver kori
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.07 }}
              className="glass rounded-3xl p-6 hover:shadow-glow transition-shadow group"
            >
              <div className="inline-grid place-items-center h-12 w-12 rounded-2xl bg-mango-gradient text-ink shadow-glow group-hover:scale-110 transition">
                <f.icon className="h-6 w-6" />
              </div>
              <h3 className="font-display text-xl font-bold mt-4">{f.title}</h3>
              <p className="mt-2 text-sm text-ink/60 leading-relaxed">
                {f.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
