import CheckoutForm from "@/components/checkout/CheckoutForm";

export const metadata = { title: "Checkout — Chapai Mango" };

export default function CheckoutPage() {
  return (
    <section className="container-x pt-10 pb-20">
      <div className="mb-8">
        <p className="text-sm font-semibold text-mango-600 mb-2">━ Checkout</p>
        <h1 className="section-title">
          Order <span className="shimmer-text">confirm korun</span>
        </h1>
      </div>
      <CheckoutForm />
    </section>
  );
}
