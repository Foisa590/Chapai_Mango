import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import type { Order, Mango } from "@/types";

export type AdminOrder = Order & { id: string; created_at: string };
export type AdminProduct = Mango;
export type AdminMessage = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  message: string;
  created_at: string;
};

const REVENUE_STATUSES = ["confirmed", "shipped", "delivered"];

export async function fetchAdminStats() {
  if (!isSupabaseConfigured()) {
    return {
      configured: false as const,
      totalOrders: 0,
      pendingOrders: 0,
      revenue: 0,
      totalProducts: 0,
      totalMessages: 0,
      recentOrders: [] as AdminOrder[]
    };
  }

  const supabase = createClient();

  const [ordersRes, productsRes, messagesRes, recentRes] = await Promise.all([
    supabase.from("orders").select("status,total"),
    supabase.from("products").select("id", { count: "exact", head: true }),
    supabase.from("contact_messages").select("id", { count: "exact", head: true }),
    supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(5)
  ]);

  const orders = (ordersRes.data || []) as { status: string; total: number }[];
  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o) => o.status === "pending").length;
  const revenue = orders
    .filter((o) => REVENUE_STATUSES.includes(o.status))
    .reduce((sum, o) => sum + Number(o.total || 0), 0);

  return {
    configured: true as const,
    totalOrders,
    pendingOrders,
    revenue,
    totalProducts: productsRes.count || 0,
    totalMessages: messagesRes.count || 0,
    recentOrders: (recentRes.data || []) as AdminOrder[]
  };
}

export async function fetchAdminOrders(status?: string) {
  if (!isSupabaseConfigured()) return [] as AdminOrder[];
  const supabase = createClient();
  let q = supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });
  if (status && status !== "all") {
    q = q.eq("status", status);
  }
  const { data } = await q;
  return (data || []) as AdminOrder[];
}

export async function fetchAdminOrder(id: string) {
  if (!isSupabaseConfigured()) return null;
  const supabase = createClient();
  const { data } = await supabase
    .from("orders")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  return (data || null) as AdminOrder | null;
}

export async function fetchAdminProducts() {
  if (!isSupabaseConfigured()) return [] as AdminProduct[];
  const supabase = createClient();
  const { data } = await supabase
    .from("products")
    .select("*")
    .order("is_featured", { ascending: false })
    .order("name");
  return (data || []) as AdminProduct[];
}

export async function fetchAdminProduct(id: string) {
  if (!isSupabaseConfigured()) return null;
  const supabase = createClient();
  const { data } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  return (data || null) as AdminProduct | null;
}

export async function fetchAdminMessages() {
  if (!isSupabaseConfigured()) return [] as AdminMessage[];
  const supabase = createClient();
  const { data } = await supabase
    .from("contact_messages")
    .select("*")
    .order("created_at", { ascending: false });
  return (data || []) as AdminMessage[];
}
