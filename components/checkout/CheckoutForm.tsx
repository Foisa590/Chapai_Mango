"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import {
  CheckCircle2,
  Copy,
  Banknote,
  Smartphone,
  Loader2
} from "lucide-react";
import { useCart } from "@/store/cart-store";
import { formatBDT } from "@/lib/utils";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import {
  calcDeliveryFee,
  config as siteConfig,
  defaultPaymentMethod,
  isPaymentMethodEnabled
} from "@/lib/config";
import type { PaymentMethod } from "@/types";
import type { User } from "@supabase/supabase-js";

const DISTRICTS = [
  "Dhaka",
  "Chittagong",
  "Rajshahi",
  "Khulna",
  "Sylhet",
  "Barishal",
  "Rangpur",
  "Mymensingh",
  "Chapainawabganj",
  "Other"
];

const schema = z
  .object({
    customer_name: z.string().min(2, "আপনার নাম লিখুন"),
    phone: z.string().min(10, "সঠিক ফোন নম্বর দিন").max(15),
    email: z.string().email().optional().or(z.literal("")),
    district: z.string().min(2, "জেলা নির্বাচন করুন"),
    address: z.string().min(8, "সম্পূর্ণ ঠিকানা লিখুন"),
    notes: z.string().optional(),
    payment_method: z.enum(["cod", "bkash", "nagad", "rocket"]),
    payment_txn_id: z.string().optional(),
    payment_sender_number: z.string().optional()
  })
  .refine(
    (data) =>
      isPaymentMethodEnabled(data.payment_method),
    {
      message: "এই পেমেন্ট পদ্ধতি বর্তমানে চালু নেই",
      path: ["payment_method"]
    }
  )
  .refine(
    (data) => {
      if (data.payment_method === "cod") return true;
      return !!data.payment_txn_id && !!data.payment_sender_number;
    },
    {
      message: "TrxID এবং sender number লাগবে",
      path: ["payment_txn_id"]
    }
  );

type FormValues = z.infer<typeof schema>;

export default function CheckoutForm() {
  const router = useRouter();
  const items = useCart((s) => s.items);
  const subtotal = useCart((s) => s.subtotal());
  const clear = useCart((s) => s.clear);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<{ id?: string } | null>(null);
  const [user, setUser] = useState<User | null>(null);

  const deliveryFee = calcDeliveryFee(subtotal);
  const total = subtotal + deliveryFee;

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors }
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { payment_method: defaultPaymentMethod() }
  });

  // Pull the signed-in user (server already redirected unauthed visitors to
  // /login). Pre-fill name/phone from sign-up metadata. Phone-only users have
  // u.email = null, so we fall back to user_metadata.email if present.
  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      const u = data.user;
      setUser(u);
      if (u) {
        const metaPhone =
          (u.user_metadata?.phone as string | undefined) || u.phone || "";
        const metaEmail =
          (u.user_metadata?.email as string | undefined) || u.email || "";
        reset((prev) => ({
          ...prev,
          customer_name:
            (u.user_metadata?.full_name as string | undefined) ||
            prev.customer_name ||
            "",
          phone: metaPhone || prev.phone || "",
          email: metaEmail || prev.email || ""
        }));
      }
    });
  }, [reset]);

  const method = watch("payment_method") as PaymentMethod;

  const mfsNumber = useMemo(() => {
    const map: Record<PaymentMethod, string | undefined> = {
      cod: undefined,
      bkash: process.env.NEXT_PUBLIC_BKASH_NUMBER,
      nagad: process.env.NEXT_PUBLIC_NAGAD_NUMBER,
      rocket: process.env.NEXT_PUBLIC_ROCKET_NUMBER
    };
    return map[method] || "01XXXXXXXXX (set in .env)";
  }, [method]);

  const onSubmit = async (values: FormValues) => {
    if (items.length === 0) {
      toast.error("কার্ট ফাঁকা — কিছু যোগ করুন");
      router.push("/products");
      return;
    }
    if (isSupabaseConfigured() && !user) {
      toast.error("অর্ডার করতে সাইন ইন করুন");
      router.push("/login?next=/checkout");
      return;
    }
    setSubmitting(true);
    try {
      const orderPayload = {
        user_id: user?.id ?? null,
        customer_name: values.customer_name,
        phone: values.phone,
        email:
          values.email ||
          user?.email ||
          (user?.user_metadata?.email as string | undefined) ||
          null,
        address: values.address,
        district: values.district,
        items,
        subtotal,
        delivery_fee: deliveryFee,
        total,
        payment_method: values.payment_method,
        payment_txn_id: values.payment_txn_id || null,
        payment_sender_number: values.payment_sender_number || null,
        notes: values.notes || null,
        status: "pending"
      };

      let id: string | undefined;
      if (isSupabaseConfigured()) {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("orders")
          .insert(orderPayload)
          .select("id")
          .single();
        if (error) throw error;
        id = data?.id;
      } else {
        console.warn("Supabase not configured; order shown but not persisted.");
        id = "demo-" + Date.now();
      }

      clear();
      setDone({ id });
      toast.success("অর্ডার কনফার্ম! ধন্যবাদ।");
    } catch (err) {
      console.error("[checkout] order insert failed:", err);
      // Surface the real reason so the user can self-diagnose (e.g. RLS,
      // missing env vars, paused project).
      const msg =
        err instanceof Error
          ? err.message
          : typeof err === "object" && err !== null && "message" in err
            ? String((err as { message?: unknown }).message)
            : "Unknown error";
      toast.error(`অর্ডার দেওয়া যায়নি: ${msg}`, { duration: 8000 });
    } finally {
      setSubmitting(false);
    }
  };

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("কপি হয়েছে: " + text);
  };

  if (done) {
    return (
      <div className="glass rounded-3xl p-10 text-center">
        <CheckCircle2 className="h-20 w-20 mx-auto text-leaf-500" />
        <h2 className="font-display-bn text-2xl sm:text-3xl font-bold mt-4">
          অর্ডার কনফার্ম!
        </h2>
        <p className="mt-2 text-ink/70 max-w-md mx-auto">
          ধন্যবাদ! আমরা আপনার অর্ডার পেয়েছি। অর্ডার ID:{" "}
          <span className="font-mono font-semibold">{done.id}</span>। আমাদের টিম
          শীঘ্রই ফোন করে কনফার্ম করবে।
        </p>
        <div className="flex gap-3 justify-center mt-6 flex-wrap">
          <Link href="/" className="btn-ghost">
            হোমে ফিরুন
          </Link>
          <Link href="/products" className="btn-primary">
            আরও কিনুন
          </Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="glass rounded-3xl p-14 text-center">
        <p className="text-ink/60">কার্ট ফাঁকা — চেকআউট করার মতো কিছু নেই।</p>
        <Link href="/products" className="btn-primary mt-5 inline-flex">
          শপে ফিরুন
        </Link>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="grid lg:grid-cols-3 gap-8"
    >
      <div className="lg:col-span-2 space-y-6">
        {/* Contact */}
        <Card title="যোগাযোগের তথ্য">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="নাম *" error={errors.customer_name?.message}>
              <input
                {...register("customer_name")}
                className="input-field"
                placeholder="মোঃ রহিম উদ্দিন"
              />
            </Field>
            <Field label="ফোন *" error={errors.phone?.message}>
              <input
                {...register("phone")}
                className="input-field"
                placeholder="01XXXXXXXXX"
              />
            </Field>
            <Field label="ইমেইল (ঐচ্ছিক)" error={errors.email?.message}>
              <input
                {...register("email")}
                className="input-field"
                placeholder="you@email.com"
              />
            </Field>
            <Field label="জেলা *" error={errors.district?.message}>
              <select {...register("district")} className="input-field">
                <option value="">জেলা নির্বাচন করুন</option>
                {DISTRICTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </Field>
          </div>
        </Card>

        {/* Address */}
        <Card title="ডেলিভারি ঠিকানা">
          <Field label="সম্পূর্ণ ঠিকানা *" error={errors.address?.message}>
            <textarea
              {...register("address")}
              rows={3}
              className="input-field"
              placeholder="বাড়ি, রোড, এরিয়া, থানা, পোস্ট কোড"
            />
          </Field>
          <Field label="বিশেষ নির্দেশনা (ঐচ্ছিক)">
            <textarea
              {...register("notes")}
              rows={2}
              className="input-field"
              placeholder="যেমন: গেটে আসার আগে ফোন দিন"
            />
          </Field>
        </Card>

        {/* Payment */}
        <Card title="পেমেন্ট পদ্ধতি">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {isPaymentMethodEnabled("cod") && (
              <PayOption
                value="cod"
                current={method}
                register={register}
                icon={<Banknote className="h-5 w-5" />}
                label="ক্যাশ অন ডেলিভারি"
                sub="পণ্য পেয়ে দেবেন"
              />
            )}
            {isPaymentMethodEnabled("bkash") && (
              <PayOption
                value="bkash"
                current={method}
                register={register}
                icon={<Smartphone className="h-5 w-5" />}
                label="bKash"
                sub="Send Money"
              />
            )}
            {isPaymentMethodEnabled("nagad") && (
              <PayOption
                value="nagad"
                current={method}
                register={register}
                icon={<Smartphone className="h-5 w-5" />}
                label="Nagad"
                sub="Send Money"
              />
            )}
            {isPaymentMethodEnabled("rocket") && (
              <PayOption
                value="rocket"
                current={method}
                register={register}
                icon={<Smartphone className="h-5 w-5" />}
                label="Rocket"
                sub="Send Money"
              />
            )}
          </div>

          {siteConfig.paymentMethods.length === 0 && (
            <p className="mt-3 text-xs text-red-700">
              কোনো পেমেন্ট পদ্ধতি চালু নেই — সাইট অ্যাডমিনকে জানান।
            </p>
          )}

          {method !== "cod" && (
            <div className="mt-5 rounded-2xl border-2 border-dashed border-mango-300 bg-mango-50 p-5">
              <p className="text-sm font-semibold text-ink mb-3">
                {method.toUpperCase()} দিয়ে{" "}
                <strong>{formatBDT(total)}</strong> &ldquo;Send Money&rdquo; /
                &ldquo;Personal&rdquo; করুন এই নম্বরে:
              </p>
              <div className="flex items-center gap-2 mb-4">
                <span className="font-display-bn text-xl sm:text-2xl font-bold text-mango-700 tracking-wider">
                  {mfsNumber}
                </span>
                <button
                  type="button"
                  onClick={() => copy(mfsNumber)}
                  className="grid place-items-center h-9 w-9 rounded-full bg-white border border-mango-300 hover:bg-mango-100"
                  aria-label="কপি করুন"
                >
                  <Copy className="h-4 w-4 text-mango-700" />
                </button>
              </div>
              <p className="text-xs text-ink/60 mb-4">
                Send-এর পর TrxID + sender number এখানে লিখুন। আমরা কনফার্ম করার
                পর অর্ডার শিপ হবে।
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field
                  label="Transaction ID *"
                  error={errors.payment_txn_id?.message}
                >
                  <input
                    {...register("payment_txn_id")}
                    className="input-field"
                    placeholder="যেমন: 9A1B2C3D4E"
                  />
                </Field>
                <Field label="যে নম্বর থেকে পাঠিয়েছেন *">
                  <input
                    {...register("payment_sender_number")}
                    className="input-field"
                    placeholder="01XXXXXXXXX"
                  />
                </Field>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Summary */}
      <aside className="lg:sticky lg:top-24 self-start glass rounded-3xl p-6">
        <h3 className="font-display-bn text-xl font-bold mb-4">অর্ডার সারমর্ম</h3>
        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
          {items.map((it) => (
            <div key={it.id} className="flex justify-between text-sm">
              <span className="text-ink/70 line-clamp-1">
                {it.name} × {it.quantity_kg} কেজি
              </span>
              <span className="font-semibold">
                {formatBDT(it.price_per_kg * it.quantity_kg)}
              </span>
            </div>
          ))}
        </div>
        <div className="my-4 border-t border-mango-200/60" />
        <div className="flex justify-between text-sm py-1">
          <span className="text-ink/70">সাবটোটাল</span>
          <span>{formatBDT(subtotal)}</span>
        </div>
        <div className="flex justify-between text-sm py-1">
          <span className="text-ink/70">ডেলিভারি</span>
          <span>{deliveryFee === 0 ? "ফ্রি" : formatBDT(deliveryFee)}</span>
        </div>
        <div className="my-3 border-t border-mango-200/60" />
        <div className="flex justify-between font-display-bn text-xl font-bold text-mango-700">
          <span>মোট</span>
          <span>{formatBDT(total)}</span>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="btn-primary w-full mt-6"
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> পাঠাচ্ছি...
            </>
          ) : (
            <>অর্ডার কনফার্ম — {formatBDT(total)}</>
          )}
        </button>
        <p className="text-[11px] text-ink/50 text-center mt-3">
          অর্ডার দিলে আপনি আমাদের শর্তাবলিতে সম্মতি দিচ্ছেন।
        </p>
      </aside>
    </form>
  );
}

function Card({
  title,
  children
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="glass rounded-3xl p-6">
      <h3 className="font-display-bn text-lg font-bold mb-4">{title}</h3>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Field({
  label,
  error,
  children
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-ink/70 mb-1.5">
        {label}
      </label>
      {children}
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
}

function PayOption({
  value,
  current,
  register,
  icon,
  label,
  sub
}: {
  value: PaymentMethod;
  current: PaymentMethod;
  register: ReturnType<typeof useForm<FormValues>>["register"];
  icon: React.ReactNode;
  label: string;
  sub: string;
}) {
  const active = current === value;
  return (
    <label
      className={`relative cursor-pointer rounded-2xl border-2 p-3 sm:p-4 text-center transition ${
        active
          ? "border-mango-500 bg-mango-100 shadow-glow"
          : "border-mango-200 bg-white hover:border-mango-300"
      }`}
    >
      <input
        type="radio"
        value={value}
        {...register("payment_method")}
        className="sr-only"
      />
      <div
        className={`mx-auto mb-1.5 grid place-items-center h-9 w-9 rounded-xl ${
          active ? "bg-mango-gradient" : "bg-mango-100"
        }`}
      >
        {icon}
      </div>
      <div className="font-semibold text-xs sm:text-sm leading-tight">
        {label}
      </div>
      <div className="text-[10px] text-ink/50 mt-0.5">{sub}</div>
    </label>
  );
}
