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


// ----- Reviews (admin moderation) -----

export async function setReviewApprovalAction(
  reviewId: string,
  isApproved: boolean
) {
  if (!isSupabaseConfigured()) {
    return { error: "Supabase not configured" };
  }
  const supabase = createClient();
  const { error } = await supabase
    .from("product_reviews")
    .update({ is_approved: isApproved })
    .eq("id", reviewId);
  if (error) return { error: error.message };
  // The recompute trigger already refreshes products.rating/review_count,
  // we just need to bust the relevant caches.
  revalidatePath("/admin/reviews");
  revalidatePath("/products");
  revalidatePath("/");
  return { ok: true };
}

export async function deleteReviewAction(reviewId: string) {
  if (!isSupabaseConfigured()) {
    return { error: "Supabase not configured" };
  }
  const supabase = createClient();
  const { error } = await supabase
    .from("product_reviews")
    .delete()
    .eq("id", reviewId);
  if (error) return { error: error.message };
  revalidatePath("/admin/reviews");
  revalidatePath("/products");
  revalidatePath("/");
  return { ok: true };
}


// ----- Push notifications (admin broadcast) -----

export type BroadcastInput = {
  title: string;
  body: string;
  url?: string;
};

export type BroadcastResult =
  | { ok: true; sent: number; removed: number; total: number }
  | { error: string };

/**
 * Fan a single notification out to every saved push subscription.
 *
 * Why a server action and not an HTTP route: this is admin-only and
 * already arrives with the auth cookie attached, so we can let RLS
 * (push subscriptions are SELECT-restricted to is_admin()) do the
 * gating for free. We still re-check explicitly so a stale RLS rule
 * can't accidentally allow a non-admin to broadcast.
 *
 * 410-Gone responses from the push service mean the subscription was
 * removed on the user's side (unsubscribed, browser uninstalled,
 * device wiped). We delete those rows so the table doesn't grow
 * forever.
 */
export async function sendBroadcastPushAction(
  input: BroadcastInput
): Promise<BroadcastResult> {
  if (!isSupabaseConfigured()) return { error: "Supabase not configured" };
  if (!input.title?.trim() || !input.body?.trim()) {
    return { error: "Title and message are required" };
  }

  const { default: webpush } = await import("web-push");

  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT || "mailto:admin@example.com";
  if (!publicKey || !privateKey) {
    return {
      error:
        "VAPID keys missing. Set NEXT_PUBLIC_VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY in env."
    };
  }
  webpush.setVapidDetails(subject, publicKey, privateKey);

  const supabase = createClient();

  // Re-check admin gate even though RLS would already block a non-admin.
  const { isAdminUser, getCurrentUser } = await import("@/lib/auth");
  const user = await getCurrentUser();
  const admin = await isAdminUser(user);
  if (!admin) return { error: "Admin only" };

  const { data: subs, error } = await supabase
    .from("push_subscriptions")
    .select("endpoint,p256dh,auth");
  if (error) return { error: error.message };

  const total = subs?.length ?? 0;
  if (!subs || subs.length === 0) {
    return { ok: true, sent: 0, removed: 0, total: 0 };
  }

  const payload = JSON.stringify({
    title: input.title.trim(),
    body: input.body.trim(),
    url: input.url?.startsWith("/") ? input.url : "/"
  });

  let sent = 0;
  const dead: string[] = [];

  await Promise.all(
    subs.map(async (s: { endpoint: string; p256dh: string; auth: string }) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: s.endpoint,
            keys: { p256dh: s.p256dh, auth: s.auth }
          },
          payload
        );
        sent += 1;
      } catch (err: unknown) {
        const status =
          typeof err === "object" && err && "statusCode" in err
            ? Number((err as { statusCode?: unknown }).statusCode)
            : null;
        // 404 (gone) and 410 (gone-perm) — subscription is dead, delete it.
        if (status === 404 || status === 410) {
          dead.push(s.endpoint);
        } else {
          console.error("[push] send failed:", err);
        }
      }
    })
  );

  let removed = 0;
  if (dead.length > 0) {
    const { error: delErr } = await supabase
      .from("push_subscriptions")
      .delete()
      .in("endpoint", dead);
    if (!delErr) removed = dead.length;
  }

  return { ok: true, sent, removed, total };
}
