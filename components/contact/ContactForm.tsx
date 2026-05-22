"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { Send } from "lucide-react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

const schema = z.object({
  name: z.string().min(2, "Apnar nam likhun"),
  email: z.string().email("Valid email din").optional().or(z.literal("")),
  phone: z.string().min(10, "Valid phone number din").optional().or(z.literal("")),
  message: z.string().min(10, "Onnoto 10 character likhun")
});

type FormValues = z.infer<typeof schema>;

export default function ContactForm() {
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    setLoading(true);
    try {
      if (isSupabaseConfigured()) {
        const supabase = createClient();
        const { error } = await supabase.from("contact_messages").insert({
          name: values.name,
          email: values.email || null,
          phone: values.phone || null,
          message: values.message
        });
        if (error) throw error;
      }
      toast.success("Message pathiyechi! Shoja amra contact korbo. Dhonnobad.");
      reset();
    } catch (err) {
      console.error(err);
      toast.error("Kichu vul holo. Abar try korun ba phone korun.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-xs font-semibold text-ink/70 mb-1.5">
          Nam *
        </label>
        <input {...register("name")} className="input-field" placeholder="Apnar nam" />
        {errors.name && (
          <p className="text-xs text-red-600 mt-1">{errors.name.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-ink/70 mb-1.5">
            Email
          </label>
          <input
            {...register("email")}
            className="input-field"
            placeholder="you@email.com"
          />
          {errors.email && (
            <p className="text-xs text-red-600 mt-1">{errors.email.message}</p>
          )}
        </div>
        <div>
          <label className="block text-xs font-semibold text-ink/70 mb-1.5">
            Phone
          </label>
          <input
            {...register("phone")}
            className="input-field"
            placeholder="01XXXXXXXXX"
          />
          {errors.phone && (
            <p className="text-xs text-red-600 mt-1">{errors.phone.message}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-ink/70 mb-1.5">
          Message *
        </label>
        <textarea
          {...register("message")}
          rows={5}
          className="input-field"
          placeholder="Apnar message ekhane likhun..."
        />
        {errors.message && (
          <p className="text-xs text-red-600 mt-1">{errors.message.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="btn-primary w-full sm:w-auto"
      >
        <Send className="h-4 w-4" />
        {loading ? "Pathacchi..." : "Message pathan"}
      </button>
    </form>
  );
}
