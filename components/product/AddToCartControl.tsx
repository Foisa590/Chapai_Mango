"use client";

import { useState } from "react";
import { Minus, Plus, ShoppingBag } from "lucide-react";
import toast from "react-hot-toast";
import { useCart } from "@/store/cart-store";
import { formatBDT } from "@/lib/utils";
import type { Mango } from "@/types";

export default function AddToCartControl({ product }: { product: Mango }) {
  const [qty, setQty] = useState(1);
  const add = useCart((s) => s.add);

  const handleAdd = () => {
    add({
      id: product.id,
      slug: product.slug,
      name: product.name,
      variety: product.variety,
      price_per_kg: product.price_per_kg,
      image: product.images[0] || "",
      quantity_kg: qty
    });
    toast.success(`${qty} kg ${product.name} added to cart`);
  };

  const total = product.price_per_kg * qty;

  return (
    <div className="space-y-5">
      <div>
        <label className="block text-xs font-semibold text-ink/60 mb-2 uppercase tracking-wider">
          Quantity (kg)
        </label>
        <div className="inline-flex items-center gap-3 rounded-full border-2 border-mango-300 bg-white p-1.5">
          <button
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="grid place-items-center h-10 w-10 rounded-full hover:bg-mango-100 transition"
            aria-label="Decrease"
          >
            <Minus className="h-4 w-4" />
          </button>
          <input
            type="number"
            value={qty}
            min={1}
            onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))}
            className="w-16 bg-transparent text-center font-display text-xl font-bold focus:outline-none"
          />
          <button
            onClick={() => setQty((q) => q + 1)}
            className="grid place-items-center h-10 w-10 rounded-full hover:bg-mango-100 transition"
            aria-label="Increase"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="glass rounded-2xl p-4 flex items-center justify-between">
        <span className="text-sm text-ink/70">Total</span>
        <span className="font-display text-2xl font-bold text-mango-700">
          {formatBDT(total)}
        </span>
      </div>

      <button onClick={handleAdd} className="btn-primary w-full text-base py-4">
        <ShoppingBag className="h-5 w-5" />
        Add to Cart
      </button>
    </div>
  );
}
