import type { Mango, Testimonial } from "@/types";

/**
 * Fallback data used when Supabase env vars are not yet configured.
 * Same data is also seeded into Supabase via supabase/schema.sql.
 */
export const MOCK_PRODUCTS: Mango[] = [
  {
    id: "1",
    name: "Premium Himsagar",
    slug: "himsagar",
    variety: "Himsagar",
    price_per_kg: 180,
    stock_kg: 500,
    images: [
      "https://images.unsplash.com/photo-1591073113125-e46713c829ed?w=1200",
      "https://images.unsplash.com/photo-1553279768-865429fa0078?w=1200"
    ],
    short_description: "Bangla aam-er raja — mishti, rosalo, sugondhi.",
    description:
      "Chapainawabganj-er gachpaka Himsagar. Atish moshrin shansh, kom shoror sathe oshadharon mishti shoad. Ekbar khele bar bar mone porbe.",
    is_featured: true,
    rating: 4.9,
    origin: "Chapainawabganj, Bangladesh",
    season: "May - June"
  },
  {
    id: "2",
    name: "Langra (Banarasi)",
    slug: "langra",
    variety: "Langra",
    price_per_kg: 200,
    stock_kg: 400,
    images: [
      "https://images.unsplash.com/photo-1553279768-865429fa0078?w=1200"
    ],
    short_description: "Sobuj-soneela rong, oshamanno mishti aam.",
    description:
      "Banarasi heritage variety — patla khosha, motkar moto motkar shansh. Chapai-er mati ar abhawate je Langra hoy ta dunia-bikhyato.",
    is_featured: true,
    rating: 4.8,
    origin: "Chapainawabganj, Bangladesh",
    season: "June - July"
  },
  {
    id: "3",
    name: "Khirsapat (Khirshapati)",
    slug: "khirsapat",
    variety: "Khirsapat",
    price_per_kg: 220,
    stock_kg: 350,
    images: [
      "https://images.unsplash.com/photo-1605027990121-cbae9e0642df?w=1200"
    ],
    short_description: "GI tag pawa Chapai-er gourab.",
    description:
      "Geographical Indication (GI) registered Khirsapat — surokkhito heritage. Khub mishti, holud moromer shansh, fiber-mukto.",
    is_featured: true,
    rating: 5.0,
    origin: "Chapainawabganj, Bangladesh",
    season: "May - July"
  },
  {
    id: "4",
    name: "Fazli",
    slug: "fazli",
    variety: "Fazli",
    price_per_kg: 150,
    stock_kg: 600,
    images: [
      "https://images.unsplash.com/photo-1596591868231-05e808fd5ec2?w=1200"
    ],
    short_description: "Boro size, late season — pickle ar kheer-er jonno best.",
    description:
      "Mostly 700g - 1.2kg per piece. Late-season aam (July-August). Achar, jam, ar pakai khaowar jonno excellent.",
    is_featured: false,
    rating: 4.6,
    origin: "Chapainawabganj, Bangladesh",
    season: "July - August"
  },
  {
    id: "5",
    name: "Amrapali",
    slug: "amrapali",
    variety: "Amrapali",
    price_per_kg: 170,
    stock_kg: 450,
    images: [
      "https://images.unsplash.com/photo-1631534179872-2b7a577b1ba2?w=1200"
    ],
    short_description: "Hybrid variety — choto, ghono mishti, fiber-less.",
    description:
      "Dashehari + Neelum-er hybrid. Khub mishti, fiber kom, lal-holud rong. Choto family-r jonno perfect.",
    is_featured: false,
    rating: 4.7,
    origin: "Chapainawabganj, Bangladesh",
    season: "June - July"
  },
  {
    id: "6",
    name: "Gopalbhog",
    slug: "gopalbhog",
    variety: "Gopalbhog",
    price_per_kg: 160,
    stock_kg: 300,
    images: [
      "https://images.unsplash.com/photo-1605027990121-cbae9e0642df?w=1200"
    ],
    short_description: "Early season aam — May-er prothome paben.",
    description:
      "Season-er prothom aam. Chamra patla, sugondh kara, mishti-tok balance. Ramadan/Eid-er prio aam.",
    is_featured: false,
    rating: 4.5,
    origin: "Chapainawabganj, Bangladesh",
    season: "May"
  }
];

export const MOCK_TESTIMONIALS: Testimonial[] = [
  {
    id: "t1",
    name: "Rashed Khan",
    location: "Dhaka",
    message:
      "Eto fresh aam onek diner por pelam. Packaging ekdom safe, ekta o nosto hoyni. Insha Allah abar order korbo.",
    rating: 5
  },
  {
    id: "t2",
    name: "Nusrat Jahan",
    location: "Chittagong",
    message:
      "Khirsapat-er shoad ekdom Chapai-er mato — joto din thakbo Chapai Mango theke i nibo.",
    rating: 5
  },
  {
    id: "t3",
    name: "Tanvir Ahmed",
    location: "Sylhet",
    message:
      "Price reasonable, delivery fast. Family ke gift hisebe pathiyechilam, shobai khushi.",
    rating: 5
  }
];

/** Try Supabase first, fall back to mock data. */
export async function getProducts(): Promise<Mango[]> {
  try {
    const { isSupabaseConfigured, createClient } = await import(
      "@/lib/supabase/server"
    );
    if (!isSupabaseConfigured()) return MOCK_PRODUCTS;
    const supabase = createClient();
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("is_featured", { ascending: false });
    if (error || !data || data.length === 0) return MOCK_PRODUCTS;
    return data as Mango[];
  } catch {
    return MOCK_PRODUCTS;
  }
}

export async function getProductBySlug(slug: string): Promise<Mango | null> {
  try {
    const { isSupabaseConfigured, createClient } = await import(
      "@/lib/supabase/server"
    );
    if (isSupabaseConfigured()) {
      const supabase = createClient();
      const { data } = await supabase
        .from("products")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();
      if (data) return data as Mango;
    }
  } catch {
    /* fall through */
  }
  return MOCK_PRODUCTS.find((p) => p.slug === slug) ?? null;
}

export async function getTestimonials(): Promise<Testimonial[]> {
  try {
    const { isSupabaseConfigured, createClient } = await import(
      "@/lib/supabase/server"
    );
    if (!isSupabaseConfigured()) return MOCK_TESTIMONIALS;
    const supabase = createClient();
    const { data } = await supabase.from("testimonials").select("*").limit(6);
    if (!data || data.length === 0) return MOCK_TESTIMONIALS;
    return data as Testimonial[];
  } catch {
    return MOCK_TESTIMONIALS;
  }
}
