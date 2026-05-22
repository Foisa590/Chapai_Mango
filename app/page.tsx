import Hero from "@/components/home/Hero";
import FeaturedMangoes from "@/components/home/FeaturedMangoes";
import WhyChooseUs from "@/components/home/WhyChooseUs";
import Testimonials from "@/components/home/Testimonials";
import CTA from "@/components/home/CTA";
import RotatingHighlights from "@/components/promo/RotatingHighlights";
import { getProducts, getTestimonials } from "@/lib/data";

export const revalidate = 3600;

export default async function HomePage() {
  const [products, testimonials] = await Promise.all([
    getProducts(),
    getTestimonials()
  ]);
  const featured = products.filter((p) => p.is_featured);
  return (
    <>
      <Hero />
      <RotatingHighlights />
      <FeaturedMangoes products={featured.length ? featured : products} />
      <WhyChooseUs />
      <Testimonials testimonials={testimonials} />
      <CTA />
    </>
  );
}
