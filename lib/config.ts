/**
 * Site-wide settings the operator can change without touching code —
 * just by setting environment variables in Railway / Vercel and
 * letting the auto-redeploy roll out (~30s).
 *
 * All values fall back to sensible defaults if the env var is unset
 * or invalid, so a fresh deploy works out of the box.
 */
import type { PaymentMethod } from "@/types";

const ALL_PAYMENT_METHODS: PaymentMethod[] = [
  "cod",
  "bkash",
  "nagad",
  "rocket",
  "upay",
  "bank"
];

const DEFAULT_DELIVERY_FEE = 120;
const DEFAULT_FREE_OVER = 2000;
const DEFAULT_MIN_ORDER_KG = 10;

function parseEnabledMethods(raw?: string): PaymentMethod[] {
  if (!raw || !raw.trim()) return [...ALL_PAYMENT_METHODS];
  const list = raw
    .split(",")
    .map((s) => s.trim().toLowerCase() as PaymentMethod)
    .filter((m) => ALL_PAYMENT_METHODS.includes(m));
  return list.length > 0 ? list : [...ALL_PAYMENT_METHODS];
}

function parseNonNegativeNumber(raw: string | undefined, fallback: number) {
  if (raw === undefined || raw === "") return fallback;
  const n = Number(raw);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
}

export const config = {
  /** Flat fee charged when the cart is below `freeDeliveryOver`. */
  deliveryFee: parseNonNegativeNumber(
    process.env.NEXT_PUBLIC_DELIVERY_FEE,
    DEFAULT_DELIVERY_FEE
  ),
  /** Cart subtotal at or above which delivery becomes free. */
  freeDeliveryOver: parseNonNegativeNumber(
    process.env.NEXT_PUBLIC_FREE_DELIVERY_OVER,
    DEFAULT_FREE_OVER
  ),
  /** Payment methods customers are allowed to pick on checkout. */
  paymentMethods: parseEnabledMethods(process.env.NEXT_PUBLIC_PAYMENT_METHODS),
  /** Minimum total kilograms across all cart items required to checkout. */
  minOrderKg: parseNonNegativeNumber(
    process.env.NEXT_PUBLIC_MIN_ORDER_KG,
    DEFAULT_MIN_ORDER_KG
  )
};

/**
 * The delivery fee that applies to the given cart subtotal.
 *
 * Three knobs:
 *   - NEXT_PUBLIC_DELIVERY_FEE=0       -> always free
 *   - NEXT_PUBLIC_FREE_DELIVERY_OVER=0 -> never free, always charge fee
 *   - subtotal >= freeDeliveryOver     -> free for that order
 *
 * Examples (defaults: fee=120, freeOver=2000):
 *   subtotal 1500 -> 120
 *   subtotal 2500 -> 0
 *   set fee=0     -> always 0
 */
export function calcDeliveryFee(subtotal: number): number {
  if (config.deliveryFee <= 0) return 0;
  if (config.freeDeliveryOver > 0 && subtotal >= config.freeDeliveryOver) {
    return 0;
  }
  return config.deliveryFee;
}

export function isPaymentMethodEnabled(method: PaymentMethod): boolean {
  return config.paymentMethods.includes(method);
}

/** First enabled payment method — used as the form default. */
export function defaultPaymentMethod(): PaymentMethod {
  return config.paymentMethods[0] ?? "cod";
}

/** Sum of `quantity_kg` across cart items. */
export function totalCartKg(items: { quantity_kg: number }[]): number {
  return items.reduce((sum, i) => sum + (i.quantity_kg || 0), 0);
}
