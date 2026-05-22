import CheckoutForm from "@/components/checkout/CheckoutForm";

export const metadata = { title: "চেকআউট — Chapai Mango House" };

export default function CheckoutPage() {
  return (
    <section className="container-x pt-10 pb-20">
      <div className="mb-8">
        <p className="text-sm font-semibold text-mango-600 mb-2">━ চেকআউট</p>
        <h1 className="section-title">
          অর্ডার <span className="shimmer-text">কনফার্ম করুন</span>
        </h1>
      </div>
      <CheckoutForm />
    </section>
  );
}
