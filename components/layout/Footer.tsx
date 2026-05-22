import Link from "next/link";
import { Facebook, Instagram, Mail, MapPin, Phone } from "lucide-react";

export default function Footer() {
  const phone = process.env.NEXT_PUBLIC_BUSINESS_PHONE || "+880 1XXX-XXXXXX";
  const email = process.env.NEXT_PUBLIC_BUSINESS_EMAIL || "hello@chapaimango.com";

  return (
    <footer className="mt-24 bg-gradient-to-b from-cream to-mango-100 border-t border-mango-200/50">
      <div className="container-x py-14 grid grid-cols-1 md:grid-cols-4 gap-10">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-3xl">🥭</span>
            <span className="font-display text-2xl font-bold">
              Chapai <span className="shimmer-text">Mango</span>
            </span>
          </div>
          <p className="text-ink/70 text-sm max-w-md leading-relaxed">
            Chapainawabganj-er gachpaka, chemical-free aam — soja apnar
            doorstep-e. Heritage variety theke hybrid — sob ekhane.
          </p>
          <div className="flex gap-3 mt-5">
            <a
              href="#"
              aria-label="Facebook"
              className="rounded-full bg-white p-2.5 border border-mango-200 hover:bg-mango-200 transition"
            >
              <Facebook className="h-4 w-4 text-mango-700" />
            </a>
            <a
              href="#"
              aria-label="Instagram"
              className="rounded-full bg-white p-2.5 border border-mango-200 hover:bg-mango-200 transition"
            >
              <Instagram className="h-4 w-4 text-mango-700" />
            </a>
          </div>
        </div>

        <div>
          <h4 className="font-display text-lg font-semibold mb-4">Explore</h4>
          <ul className="space-y-2 text-sm text-ink/70">
            <li><Link href="/" className="hover:text-mango-700">Home</Link></li>
            <li><Link href="/products" className="hover:text-mango-700">Shop</Link></li>
            <li><Link href="/about" className="hover:text-mango-700">About</Link></li>
            <li><Link href="/contact" className="hover:text-mango-700">Contact</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-display text-lg font-semibold mb-4">Contact</h4>
          <ul className="space-y-3 text-sm text-ink/70">
            <li className="flex items-start gap-2">
              <Phone className="h-4 w-4 text-mango-600 mt-0.5 shrink-0" />
              <span>{phone}</span>
            </li>
            <li className="flex items-start gap-2">
              <Mail className="h-4 w-4 text-mango-600 mt-0.5 shrink-0" />
              <span>{email}</span>
            </li>
            <li className="flex items-start gap-2">
              <MapPin className="h-4 w-4 text-mango-600 mt-0.5 shrink-0" />
              <span>Chapainawabganj, Bangladesh</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-mango-200/50">
        <div className="container-x py-5 text-center text-xs text-ink/60">
          © {new Date().getFullYear()} Chapai Mango. Made with 🥭 in Bangladesh.
        </div>
      </div>
    </footer>
  );
}
