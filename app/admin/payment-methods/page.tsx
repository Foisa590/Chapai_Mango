import { CreditCard } from "lucide-react";
import PageHeader from "@/components/admin/PageHeader";
import { fetchAdminPaymentMethods } from "@/lib/admin/data";
import { formatBDT } from "@/lib/utils";
import PaymentMethodForm from "./PaymentMethodForm";
import PaymentMethodRowActions from "./PaymentMethodRowActions";

export const dynamic = "force-dynamic";

/**
 * Manage every payment method shown on /checkout. Operator can:
 *   - toggle methods on/off (e.g. turn COD off during Eid rush)
 *   - set the receiving number per method (or full bank-account string)
 *   - set a fixed advance amount the customer must pay up front
 *     (e.g. "100 BDT advance via bKash before COD orders ship")
 *   - add new methods (Upay/bank/whatever future rail launches)
 *   - reorder via sort_order
 *
 * The list shows the legacy NEXT_PUBLIC_*_NUMBER fallback in
 * grey when account_number is blank, so it's obvious which
 * methods still need a real number.
 */
export default async function AdminPaymentMethodsPage() {
  const methods = await fetchAdminPaymentMethods();
  const activeCount = methods.filter((m) => m.is_active).length;

  return (
    <>
      <PageHeader
        title="Payment Methods"
        subtitle={`${methods.length} method${
          methods.length === 1 ? "" : "s"
        } · ${activeCount} live on checkout`}
      />

      <div className="mb-6">
        <PaymentMethodForm />
      </div>

      {methods.length === 0 ? (
        <div className="glass rounded-2xl p-14 text-center">
          <CreditCard className="h-14 w-14 mx-auto text-mango-400" />
          <p className="mt-3 font-display text-lg">Akhono kichu nei</p>
          <p className="text-sm text-ink/50 mt-1">
            Run supabase/payment-methods.sql in SQL Editor to seed the
            6 default methods, or add your own with the form above.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {methods.map((m) => (
            <div
              key={m.id}
              className="glass rounded-2xl px-4 py-3 flex items-start justify-between gap-3 flex-wrap"
            >
              <div className="flex items-start gap-3 min-w-0 flex-1">
                <div className="grid place-items-center h-10 w-10 rounded-xl bg-mango-gradient text-ink font-display font-bold text-sm shrink-0">
                  {m.label.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div
                    className={`text-sm font-bold leading-snug break-words ${
                      m.is_active ? "text-ink" : "text-ink/40 line-through"
                    }`}
                  >
                    {m.label}{" "}
                    <span className="font-mono text-[10px] uppercase text-ink/40">
                      {m.code}
                    </span>
                  </div>
                  <div className="text-xs text-ink/60 mt-0.5">
                    {m.account_number ? (
                      <span className="font-mono">{m.account_number}</span>
                    ) : (
                      <span className="text-orange-700/60 italic">
                        কোনো নম্বর সেট নেই — env var fallback
                      </span>
                    )}
                    {m.advance_amount > 0 && (
                      <>
                        {" · "}Advance{" "}
                        <strong>{formatBDT(m.advance_amount)}</strong>
                      </>
                    )}
                  </div>
                  <div className="text-[10px] text-ink/40 mt-0.5">
                    Order {m.sort_order} ·{" "}
                    {m.is_active ? (
                      <span className="text-leaf-600 font-semibold">live</span>
                    ) : (
                      <span className="text-red-500 font-semibold">hidden</span>
                    )}
                  </div>
                </div>
              </div>
              <PaymentMethodRowActions method={m} />
            </div>
          ))}
        </div>
      )}
    </>
  );
}
