export type Mango = {
  id: string;
  name: string;
  slug: string;
  variety: string;
  price_per_kg: number;
  stock_kg: number;
  images: string[];
  description: string;
  short_description: string;
  is_featured: boolean;
  rating: number;
  origin: string;
  season: string;
};

export type CartItem = {
  id: string;
  slug: string;
  name: string;
  variety: string;
  price_per_kg: number;
  image: string;
  quantity_kg: number;
};

export type PaymentMethod = "cod" | "bkash" | "nagad" | "rocket";

export type Order = {
  id?: string;
  user_id?: string | null;
  customer_name: string;
  phone: string;
  email?: string;
  address: string;
  district: string;
  items: CartItem[];
  subtotal: number;
  delivery_fee: number;
  total: number;
  payment_method: PaymentMethod;
  payment_txn_id?: string;
  payment_sender_number?: string;
  notes?: string;
  status?: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
  created_at?: string;
};

export type Testimonial = {
  id: string;
  name: string;
  location: string;
  message: string;
  rating: number;
};
