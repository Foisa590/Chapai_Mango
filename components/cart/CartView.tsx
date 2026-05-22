"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useCart } from "@/store/cart-store";
import { formatBDT } from "@/lib/utils";

export default function CartView() {
  const items = useCart((s) => s.items);
  const setQty = useCart((s) => s.setQty);
  const remove = useCart((s) => s.remove);
  const subtotal = useCart((s) => s.subtotal());

  if (items.length === 0) {
    return (
      <div className="glass rounded-3xl p-14 text-center">
        <ShoppingBag className="h-16 w-16 mx-auto text-mango-400" />
        <h2 className="font-display text-2xl font-bold mt-4">
          Cart faka
        </h2>
        <p className="mt-2 text-ink/60">
          Apnar prio aam choose kore cart-e add korun.
        </p>
        <Link href="/products" className="btn-primary mt-6 inline-flex">
          Shop dekhun
        </Link>
      </div>
    );
  }

  const deliveryFee = subtotal >= 2000 ? 0 : 120;
  const total = subtotal + deliveryFee;

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-4">
        {items.map((it) => (
          <div
            key={it.id}
            className="glass rounded-3xl p-4 flex gap-4 items-center"
          >
            <div className="relative h-24 w-24 sm:h-28 sm:w-28 rounded-2xl overflow-hidden bg-mango-100 shrink-0">
              {it.image && (
                <Image src={it.image} alt={it.name} fill className="object-cover" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <Link
                href={`/products/${it.slug}`}
                className="font-display text-base sm:text-lg font-bold hover:text-mango-700 line-clamp-1"
              >
                {it.name}
              </Link>
              <div className="text-xs text-mango-600 font-semibold mt-0.5">
                {it.variety}
              </div>
              <div className="mt-2 flex items-center justify-between flex-wrap gap-2">
                <div className="inline-flex items-center gap-2 rounded-full border border-mango-300 bg-white p-1">
                  <button
                    onClick={() => setQty(it.id, it.quantity_kg - 1)}
                    className="grid place-items-center h-8 w-8 rounded-full hover:bg-mango-100"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="min-w-[2ch] text-center text-sm font-semibold">
                    {it.quantity_kg}kg
                  </span>
                  <button
                    onClick={() => setQty(it.id, it.quantity_kg + 1)}
                    className="grid place-items-center h-8 w-8 rounded-full hover:bg-mango-100"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="font-display text-lg font-bold text-mango-700">
                  {formatBDT(it.price_per_kg * it.quantity_kg)}
                </div>
              </div>
            </div>
            <button
              onClick={() => remove(it.id)}
              className="grid place-items-center h-9 w-9 rounded-full text-red-500 hover:bg-red-50 shrink-0"
              aria-label="Remove"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      <aside className="lg:sticky lg:top-24 self-start glass rounded-3xl p-6">
        <h3 className="font-display text-xl font-bold mb-4">Order Summary</h3>
        <Row label="Subtotal" value={formatBDT(subtotal)} />
        <Row
          label="Delivery"
          value={deliveryFee === 0 ? "Free" : formatBDT(deliveryFee)}
        />
        {subtotal < 2000 && (
          <p className="text-[11px] text-mango-700 mt-1">
            ৳{2000 - subtotal} aro buy korun → Free delivery!
          </p>
        )}
        <div className="my-4 border-t border-mango-200/60" />
        <Row label="Total" value={formatBDT(total)} bold />

        <Link href="/checkout" className="btn-primary w-full mt-6">
          Checkout
        </Link>
        <Link
          href="/products"
          className="block text-center mt-3 text-xs text-ink/60 hover:text-mango-700"
        >
          ← Aro shopping korun
        </Link>
      </aside>
    </div>
  );
}

function Row({
  label,
  value,
  bold
}: {
  label: string;
  value: string;
  bold?: boolean;
}) {
  return (
    <div
      className={`flex justify-between items-baseline py-1 ${
        bold ? "font-display text-xl font-bold text-mango-700" : "text-sm"
      }`}
    >
      <span className={bold ? "" : "text-ink/70"}>{label}</span>
      <span>{value}</span>
    </div>
  );
}
