import { Banknote, Building2, CreditCard, Smartphone } from "lucide-react";
import { getActivePaymentMethods } from "@/lib/data";
import type { PaymentMethodConfig } from "@/types";

/**
 * "We accept these payment methods" strip in the footer.
 *
 * Renders the live list of admin-managed methods from
 * `getActivePaymentMethods()` — when the operator toggles a
 * method off / adds Upay / etc. from /admin/payment-methods,
 * the footer reflects it on the next page render.
 *
 * Each pill is a brand-coloured rounded badge with the method
 * label. We deliberately avoid using bitmap brand logos (bKash,
 * Nagad, Rocket trademarks) — the brand-coloured badges look
 * professional, render in any locale, and stay crisp on every
 * screen. Server component, zero JS shipped.
 */
export default async function AcceptedPayments() {
  const methods = await getActivePaymentMethods();

  if (methods.length === 0) return null;

  return (
    <div className="border-t border-mango-200/50">
      <div className="container-x py-7 flex flex-col items-center gap-3">
        <p className="text-xs uppercase tracking-wider text-ink/50 font-bold">
          We Accept
        </p>
        <div className="flex flex-wrap items-center justify-center gap-2.5">
          {methods.map((m) => (
            <BrandBadge key={m.id} method={m} />
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Brand colour palette per known method. Picked to match the
 * official brand without infringing the bitmap mark.
 *
 * `text` is the brand-name pill text — usually the English
 * brand label even though the rest of the site is Bangla,
 * because the brand is recognised by its English wordmark.
 */
const BRANDS: Record<
  string,
  {
    bg: string;
    fg: string;
    text: string;
    icon: typeof Banknote;
  }
> = {
  cod: {
    bg: "bg-leaf-500",
    fg: "text-white",
    text: "COD",
    icon: Banknote
  },
  bkash: {
    bg: "bg-[#E2136E]",
    fg: "text-white",
    text: "bKash",
    icon: Smartphone
  },
  nagad: {
    bg: "bg-[#EE3225]",
    fg: "text-white",
    text: "Nagad",
    icon: Smartphone
  },
  rocket: {
    bg: "bg-[#7B0091]",
    fg: "text-white",
    text: "Rocket",
    icon: Smartphone
  },
  upay: {
    bg: "bg-[#00A99D]",
    fg: "text-white",
    text: "Upay",
    icon: Smartphone
  },
  bank: {
    bg: "bg-ink",
    fg: "text-white",
    text: "Bank",
    icon: Building2
  }
};

function BrandBadge({ method }: { method: PaymentMethodConfig }) {
  // Look up by `code` first (admins editing labels won't break
  // the colour mapping), then fall back to a generic pill.
  const brand = BRANDS[method.code] ?? {
    bg: "bg-mango-700",
    fg: "text-white",
    text: method.label,
    icon: CreditCard
  };
  const Icon = brand.icon;
  // Use the brand's English text for known codes; for custom admin-
  // added methods, use the operator's chosen label.
  const label = BRANDS[method.code] ? brand.text : method.label;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-bold shadow-soft ${brand.bg} ${brand.fg}`}
      title={method.label}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </span>
  );
}
