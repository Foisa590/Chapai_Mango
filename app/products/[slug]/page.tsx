import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, MapPin, Calendar, Star, Leaf } from "lucide-react";
import ProductGallery from "@/components/product/ProductGallery";
import AddToCartControl from "@/components/product/AddToCartControl";
import { getProductBySlug, getProducts } from "@/lib/data";
import { formatBDT } from "@/lib/utils";

export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params
}: {
  params: { slug: string };
}) {
  const product = await getProductBySlug(params.slug);
  if (!product) return { title: "Not found" };
  return {
    title: `${product.name} — Chapai Mango`,
    description: product.short_description
  };
}

export default async function ProductDetailPage({
  params
}: {
  params: { slug: string };
}) {
  const product = await getProductBySlug(params.slug);
  if (!product) notFound();

  return (
    <section className="container-x pt-8 pb-20">
      <Link
        href="/products"
        className="inline-flex items-center gap-1 text-sm text-mango-700 hover:gap-2 transition-all mb-6"
      >
        <ChevronLeft className="h-4 w-4" /> Back to Shop
      </Link>

      <div className="grid lg:grid-cols-2 gap-10 lg:gap-14">
        <ProductGallery images={product.images} name={product.name} />

        <div>
          <div className="text-xs uppercase tracking-widest text-mango-600 font-semibold">
            {product.variety}
          </div>
          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold mt-2 leading-tight">
            {product.name}
          </h1>

          <div className="mt-3 flex items-center gap-4 text-sm">
            <span className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-mango-500 text-mango-500" />
              <span className="font-semibold">{product.rating.toFixed(1)}</span>
              <span className="text-ink/50">/ 5</span>
            </span>
            <span className="text-ink/40">·</span>
            <span className="text-ink/60">In stock: {product.stock_kg} kg</span>
          </div>

          <div className="mt-6 flex items-end gap-2">
            <span className="font-display text-4xl sm:text-5xl font-bold text-mango-700">
              {formatBDT(product.price_per_kg)}
            </span>
            <span className="text-ink/50 mb-2">/ kg</span>
          </div>

          <p className="mt-5 text-ink/75 leading-relaxed">
            {product.description}
          </p>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Info icon={<MapPin className="h-4 w-4" />} label="Origin" value={product.origin} />
            <Info icon={<Calendar className="h-4 w-4" />} label="Season" value={product.season} />
            <Info icon={<Leaf className="h-4 w-4" />} label="Quality" value="Chemical-free" />
          </div>

          <div className="mt-8">
            <AddToCartControl product={product} />
          </div>

          <div className="mt-6 glass rounded-2xl p-4 text-xs text-ink/70 leading-relaxed">
            <strong className="text-ink">Delivery:</strong> Dhaka-er moddhe 24
            ghonta · Bangladesh-er sob district-e 48-72 ghonta · Order
            confirmation-er por SMS / call paben.
          </div>
        </div>
      </div>
    </section>
  );
}

function Info({
  icon,
  label,
  value
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="glass rounded-2xl p-3">
      <div className="flex items-center gap-1.5 text-mango-600 text-xs font-semibold">
        {icon}
        {label}
      </div>
      <div className="mt-1 text-sm font-medium text-ink">{value}</div>
    </div>
  );
}
