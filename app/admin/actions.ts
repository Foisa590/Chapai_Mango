"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";

// ----- Auth -----

export async function signOutAction() {
  if (isSupabaseConfigured()) {
    const supabase = createClient();
    await supabase.auth.signOut();
  }
  redirect("/admin/login");
}

// ----- Orders -----

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "shipped"
  | "delivered"
  | "cancelled";

export async function updateOrderStatusAction(
  orderId: string,
  status: OrderStatus
) {
  if (!isSupabaseConfigured()) {
    return { error: "Supabase not configured" };
  }
  const supabase = createClient();
  const { error } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", orderId);
  if (error) return { error: error.message };
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin");
  return { ok: true };
}

export async function deleteOrderAction(orderId: string) {
  if (!isSupabaseConfigured()) {
    return { error: "Supabase not configured" };
  }
  const supabase = createClient();
  const { error } = await supabase.from("orders").delete().eq("id", orderId);
  if (error) return { error: error.message };
  revalidatePath("/admin/orders");
  revalidatePath("/admin");
  return { ok: true };
}

// ----- Products -----

export type ProductInput = {
  name: string;
  slug: string;
  variety: string;
  price_per_kg: number;
  stock_kg: number;
  images: string[];
  short_description: string;
  description: string;
  is_featured: boolean;
  rating: number;
  origin: string;
  season: string;
};

export async function upsertProductAction(
  input: ProductInput,
  productId?: string
) {
  if (!isSupabaseConfigured()) {
    return { error: "Supabase not configured" };
  }
  const supabase = createClient();

  if (productId) {
    const { error } = await supabase
      .from("products")
      .update(input)
      .eq("id", productId);
    if (error) return { error: error.message };
  } else {
    const { error } = await supabase.from("products").insert(input);
    if (error) return { error: error.message };
  }

  revalidatePath("/admin/products");
  revalidatePath("/products");
  revalidatePath("/");
  return { ok: true };
}

export async function deleteProductAction(productId: string) {
  if (!isSupabaseConfigured()) {
    return { error: "Supabase not configured" };
  }
  const supabase = createClient();
  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", productId);
  if (error) return { error: error.message };
  revalidatePath("/admin/products");
  revalidatePath("/products");
  revalidatePath("/");
  return { ok: true };
}

// ----- Contact messages -----

export async function deleteMessageAction(messageId: string) {
  if (!isSupabaseConfigured()) {
    return { error: "Supabase not configured" };
  }
  const supabase = createClient();
  const { error } = await supabase
    .from("contact_messages")
    .delete()
    .eq("id", messageId);
  if (error) return { error: error.message };
  revalidatePath("/admin/messages");
  return { ok: true };
}
