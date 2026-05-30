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

// ─────────────────────────────────────────────────────────────────
// Per-method config — receiving number + fixed advance amount
// ─────────────────────────────────────────────────────────────────
//
// Every method has TWO env vars the operator can set on Railway:
//
//   NEXT_PUBLIC_<CODE>_NUMBER    receiving MFS number / bank account text
//   NEXT_PUBLIC_<CODE>_ADVANCE   fixed amount the customer must pay UP
//                                FRONT before the order ships (BDT)
//
// Examples:
//   NEXT_PUBLIC_BKASH_NUMBER=01712345678
//   NEXT_PUBLIC_BKASH_ADVANCE=200
//
//   NEXT_PUBLIC_BANK_NUMBER=DBBL · A/C 1234567890 · Branch X
//   NEXT_PUBLIC_BANK_ADVANCE=0           (= full amount on transfer)
//
//   NEXT_PUBLIC_COD_ADVANCE=100          (booking deposit on COD)
//
// Rules for the resulting "amount to send now":
//   * advance > 0          → advance (booking deposit, rest paid on
//                            delivery if there is one)
//   * cod with advance=0   → 0 (full amount paid in cash on delivery)
//   * online with adv=0    → full order total (classic prepaid)

export type PaymentMethodInfo = {
  code: PaymentMethod;
  /** Bangla label shown on the checkout card. */
  label: string;
  /** Receiving MFS number / bank account string from env. */
  accountNumber: string;
  /** Fixed BDT amount required up front (0 = no advance). */
  advance: number;
  /** Free-form helper text shown under the selected card. */
  instructions: string;
};

/** Default labels + instructions per method. The operator can still
 *  override behaviour via the env-var pair above; only label+text are
 *  hard-coded so the UI stays Bangla and consistent. */
const METHOD_DEFAULTS: Record<
  PaymentMethod,
  { label: string; instructions: string }
> = {
  cod: {
    label: "ক্যাশ অন ডেলিভারি",
    instructions: "পণ্য পেয়ে কুরিয়ারের কাছে নগদ পরিশোধ করুন।"
  },
  bkash: {
    label: "bKash",
    instructions:
      "উপরের নম্বরে Send Money করুন → TrxID + sender number ফর্মে দিন।"
  },
  nagad: {
    label: "Nagad",
    instructions:
      "উপরের নম্বরে Send Money করুন → TrxID + sender number ফর্মে দিন।"
  },
  rocket: {
    label: "Rocket",
    instructions:
      "উপরের নম্বরে Send Money করুন → TrxID + sender number ফর্মে দিন।"
  },
  upay: {
    label: "Upay",
    instructions:
      "উপরের Upay নম্বরে Send Money করুন → TrxID + sender number ফর্মে দিন।"
  },
  bank: {
    label: "ব্যাংক ট্রান্সফার",
    instructions:
      "উপরের অ্যাকাউন্টে ফান্ড ট্রান্সফার করুন এবং রেফারেন্স ফর্মে দিন।"
  }
};

/** Read NEXT_PUBLIC_<CODE>_NUMBER for a method, with a per-code
 *  fallback so the older NEXT_PUBLIC_BKASH_NUMBER style env vars
 *  keep working if an operator hasn't touched them. */
function readNumber(code: PaymentMethod): string {
  // Direct env-var pickup. Hard-coded refs (not template-string lookups)
  // because Next.js inlines NEXT_PUBLIC_* at build time and dynamic keys
  // wouldn't resolve.
  switch (code) {
    case "bkash":
      return (process.env.NEXT_PUBLIC_BKASH_NUMBER || "").trim();
    case "nagad":
      return (process.env.NEXT_PUBLIC_NAGAD_NUMBER || "").trim();
    case "rocket":
      return (process.env.NEXT_PUBLIC_ROCKET_NUMBER || "").trim();
    case "upay":
      return (process.env.NEXT_PUBLIC_UPAY_NUMBER || "").trim();
    case "bank":
      return (process.env.NEXT_PUBLIC_BANK_NUMBER || "").trim();
    default:
      return "";
  }
}

function readAdvance(code: PaymentMethod): number {
  switch (code) {
    case "cod":
      return parseNonNegativeNumber(process.env.NEXT_PUBLIC_COD_ADVANCE, 0);
    case "bkash":
      return parseNonNegativeNumber(process.env.NEXT_PUBLIC_BKASH_ADVANCE, 0);
    case "nagad":
      return parseNonNegativeNumber(process.env.NEXT_PUBLIC_NAGAD_ADVANCE, 0);
    case "rocket":
      return parseNonNegativeNumber(process.env.NEXT_PUBLIC_ROCKET_ADVANCE, 0);
    case "upay":
      return parseNonNegativeNumber(process.env.NEXT_PUBLIC_UPAY_ADVANCE, 0);
    case "bank":
      return parseNonNegativeNumber(process.env.NEXT_PUBLIC_BANK_ADVANCE, 0);
    default:
      return 0;
  }
}

/** Full info bundle for a single payment method. */
export function paymentMethodInfo(code: PaymentMethod): PaymentMethodInfo {
  const def = METHOD_DEFAULTS[code];
  return {
    code,
    label: def.label,
    accountNumber: readNumber(code),
    advance: readAdvance(code),
    instructions: def.instructions
  };
}

/** All ENABLED methods, in the same order as `paymentMethods`. */
export function getEnabledPaymentMethodsInfo(): PaymentMethodInfo[] {
  return config.paymentMethods.map(paymentMethodInfo);
}

/**
 * How much the customer has to pay RIGHT NOW for this method.
 * 0 means classic COD (pay full on delivery).
 */
export function amountToSendNow(
  info: PaymentMethodInfo,
  total: number
): number {
  if (info.advance > 0) return info.advance;
  if (info.code === "cod") return 0;
  return total;
}
