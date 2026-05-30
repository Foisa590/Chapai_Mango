"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { Loader2, Save } from "lucide-react";
import {
  upsertPaymentMethodAction,
  type PaymentMethodInput
} from "@/app/admin/actions";
import type { AdminPaymentMethod } from "@/lib/admin/data";
import type { PaymentIconKey } from "@/types";

const ICON_KEYS: PaymentIconKey[] = [
  "cod",
  "bkash",
  "nagad",
  "rocket",
  "upay",
  "bank",
  "generic"
];

// Built-in codes are pre-seeded by the migration. Editing them is
// fine but renaming the code would orphan existing orders that
// reference the old code, so we lock the field in edit mode.
const BUILT_IN_CODES = new Set(["cod", "bkash", "nagad", "rocket", "upay", "bank"]);

const schema = z.object({
  code: z
    .string()
    .min(2, "Code dorkar")
    .max(31, "Onek boro")
    .regex(/^[a-z][a-z0-9_]*$/, "Lowercase a-z / 0-9 / _ only, must start with a-z"),
  label: z.string().min(2, "Label dorkar").max(80),
  account_number: z.string().max(200).optional().default(""),
  advance_amount: z.coerce.number().int().min(0).max(1_000_000),
  instructions: z.string().max(1000).optional().default(""),
  icon_key: z.enum([
    "cod",
    "bkash",
    "nagad",
    "rocket",
    "upay",
    "bank",
    "generic"
  ]),
  is_active: z.boolean(),
  sort_order: z.coerce.number().int().min(0).max(9999)
});

type FormValues = z.infer<typeof schema>;

export default function PaymentMethodForm({
  method,
  onDone
}: {
  method?: AdminPaymentMethod;
  onDone?: () => void;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const isEditing = !!method;
  const isBuiltIn = method ? BUILT_IN_CODES.has(method.code) : false;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      code: method?.code ?? "",
      label: method?.label ?? "",
      account_number: method?.account_number ?? "",
      advance_amount: method?.advance_amount ?? 0,
      instructions: method?.instructions ?? "",
      icon_key: method?.icon_key ?? "generic",
      is_active: method?.is_active ?? true,
      sort_order: method?.sort_order ?? 100
    }
  });

  const onSubmit = (values: FormValues) => {
    startTransition(async () => {
      const payload: PaymentMethodInput = {
        code: values.code,
        label: values.label,
        account_number: values.account_number || "",
        advance_amount: values.advance_amount,
        instructions: values.instructions || "",
        icon_key: values.icon_key,
        is_active: values.is_active,
        sort_order: values.sort_order
      };
      const res = await upsertPaymentMethodAction(payload, method?.id);
      if (res?.error) {
        toast.error(res.error);
        return;
      }
      toast.success(isEditing ? "Method updated" : "Method added");
      if (!isEditing) {
        reset({
          code: "",
          label: "",
          account_number: "",
          advance_amount: 0,
          instructions: "",
          icon_key: "generic",
          is_active: true,
          sort_order: 100
        });
      }
      onDone?.();
      router.refresh();
    });
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="glass rounded-2xl p-5 space-y-4"
    >
      <h3 className="font-display text-base font-bold">
        {isEditing ? "Edit payment method" : "Add new payment method"}
      </h3>

      <div className="grid grid-cols-12 gap-3">
        <div className="col-span-12 sm:col-span-3">
          <label className="block text-xs font-semibold text-ink/70 mb-1.5">
            Code *
          </label>
          <input
            {...register("code")}
            disabled={isBuiltIn}
            className="input-field font-mono lowercase disabled:opacity-60 disabled:cursor-not-allowed"
            placeholder="e.g. bkash"
          />
          {errors.code && (
            <p className="text-xs text-red-600 mt-1">{errors.code.message}</p>
          )}
          {isBuiltIn && (
            <p className="text-[10px] text-ink/40 mt-1">
              Built-in code, locked
            </p>
          )}
        </div>

        <div className="col-span-12 sm:col-span-5">
          <label className="block text-xs font-semibold text-ink/70 mb-1.5">
            Label *
          </label>
          <input
            {...register("label")}
            className="input-field"
            placeholder="যেমন: bKash"
          />
          {errors.label && (
            <p className="text-xs text-red-600 mt-1">{errors.label.message}</p>
          )}
        </div>

        <div className="col-span-6 sm:col-span-2">
          <label className="block text-xs font-semibold text-ink/70 mb-1.5">
            Icon
          </label>
          <select {...register("icon_key")} className="input-field">
            {ICON_KEYS.map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>
        </div>

        <div className="col-span-6 sm:col-span-2">
          <label className="block text-xs font-semibold text-ink/70 mb-1.5">
            Order
          </label>
          <input
            type="number"
            min={0}
            step={10}
            {...register("sort_order", { valueAsNumber: true })}
            className="input-field"
          />
        </div>

        <div className="col-span-12 sm:col-span-7">
          <label className="block text-xs font-semibold text-ink/70 mb-1.5">
            Account number / Bank details
          </label>
          <input
            {...register("account_number")}
            className="input-field font-mono"
            placeholder="01XXXXXXXXX  (or DBBL A/C 1234567890)"
          />
          <p className="text-[10px] text-ink/40 mt-1">
            ফাঁকা রাখলে NEXT_PUBLIC_&lt;CODE&gt;_NUMBER env var fallback ব্যবহার হবে।
          </p>
        </div>

        <div className="col-span-12 sm:col-span-3">
          <label className="block text-xs font-semibold text-ink/70 mb-1.5">
            Fixed advance (BDT)
          </label>
          <input
            type="number"
            min={0}
            step={10}
            {...register("advance_amount", { valueAsNumber: true })}
            className="input-field"
            placeholder="0"
          />
          {errors.advance_amount && (
            <p className="text-xs text-red-600 mt-1">
              {errors.advance_amount.message}
            </p>
          )}
          <p className="text-[10px] text-ink/40 mt-1">
            0 = no advance · e.g. 100 = booking deposit
          </p>
        </div>

        <div className="col-span-12 sm:col-span-2 flex items-end">
          <label className="flex items-center gap-2 cursor-pointer pb-2">
            <input
              type="checkbox"
              {...register("is_active")}
              className="h-4 w-4 accent-mango-500"
            />
            <span className="text-xs font-semibold text-ink/70">Active</span>
          </label>
        </div>

        <div className="col-span-12">
          <label className="block text-xs font-semibold text-ink/70 mb-1.5">
            Instructions (shown on /checkout)
          </label>
          <textarea
            {...register("instructions")}
            rows={2}
            className="input-field resize-y"
            placeholder="যেমন: উপরের নম্বরে Send Money করুন → TrxID + sender number ফর্মে দিন।"
          />
          {errors.instructions && (
            <p className="text-xs text-red-600 mt-1">
              {errors.instructions.message}
            </p>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-2">
        {onDone && (
          <button
            type="button"
            onClick={onDone}
            className="rounded-full border border-mango-200 bg-white px-4 py-2 text-xs font-semibold text-ink/70 hover:bg-mango-50"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={pending}
          className="btn-primary text-sm py-2"
        >
          {pending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              {isEditing ? "Save changes" : "Add method"}
            </>
          )}
        </button>
      </div>
    </form>
  );
}
