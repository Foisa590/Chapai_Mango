import ProductsExplorer from "@/components/product/ProductsExplorer";
import { getProducts } from "@/lib/data";

export const metadata = {
  title: "Shop — Chapai Mango",
  description: "Order premium Chapainawabganj mangoes online."
};

export const revalidate = 1800;

export default async function ProductsPage() {
  const products = await getProducts();
  return (
    <section className="container-x pt-10 pb-20">
      <div className="text-center mb-10 max-w-2xl mx-auto">
        <p className="text-sm font-semibold text-mango-600 mb-2">━ Shop</p>
        <h1 className="section-title">
          Amader <span className="shimmer-text">Aam Collection</span>
        </h1>
        <p className="mt-3 text-ink/60">
          Heritage variety theke hybrid — sob aam ek jaygay.
        </p>
      </div>
      <ProductsExplorer products={products} />
    </section>
  );
}
