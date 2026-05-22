"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, ShoppingBag, X } from "lucide-react";
import { useCart } from "@/store/cart-store";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Shop" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" }
];

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const items = useCart((s) => s.items);
  const count = items.reduce((sum, i) => sum + i.quantity_kg, 0);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-cream/80 backdrop-blur-xl border-b border-mango-200/50 shadow-soft"
          : "bg-transparent"
      )}
    >
      <div className="container-x flex h-16 sm:h-20 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="text-3xl group-hover:animate-float">🥭</span>
          <span className="font-display text-xl sm:text-2xl font-bold text-ink">
            Chapai <span className="shimmer-text">Mango</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {NAV.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative text-sm font-medium transition-colors",
                  active ? "text-mango-700" : "text-ink/70 hover:text-mango-600"
                )}
              >
                {item.label}
                {active && (
                  <span className="absolute -bottom-1 left-0 right-0 h-0.5 rounded-full bg-mango-gradient" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/cart"
            className="relative rounded-full bg-white/70 p-2.5 border border-mango-200 hover:bg-mango-100 transition"
            aria-label="Cart"
          >
            <ShoppingBag className="h-5 w-5 text-mango-700" />
            {count > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-mango-gradient text-[11px] font-bold text-ink grid place-items-center shadow-glow">
                {count}
              </span>
            )}
          </Link>

          <button
            onClick={() => setOpen((v) => !v)}
            className="md:hidden rounded-full bg-white/70 p-2.5 border border-mango-200"
            aria-label="Menu"
          >
            {open ? (
              <X className="h-5 w-5 text-mango-700" />
            ) : (
              <Menu className="h-5 w-5 text-mango-700" />
            )}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-mango-200/50 bg-cream/95 backdrop-blur-xl">
          <nav className="container-x flex flex-col py-4">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="py-3 text-base font-medium text-ink/80 hover:text-mango-700"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
