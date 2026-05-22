import CartView from "@/components/cart/CartView";

export const metadata = { title: "Cart — Chapai Mango" };

export default function CartPage() {
  return (
    <section className="container-x pt-10 pb-20">
      <div className="mb-8">
        <p className="text-sm font-semibold text-mango-600 mb-2">━ Cart</p>
        <h1 className="section-title">
          Apnar <span className="shimmer-text">cart</span>
        </h1>
      </div>
      <CartView />
    </section>
  );
}
