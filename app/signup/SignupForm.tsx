"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Loader2, Mail, Smartphone, UserPlus } from "lucide-react";
import toast from "react-hot-toast";
import { createClient } from "@/lib/supabase/client";
import {
  isValidBdPhone,
  normalizeBdPhone,
  phoneToSyntheticEmail
} from "@/lib/phone";
import { cn } from "@/lib/utils";

type AuthMode = "phone" | "email";

export default function SignupForm() {
  const search = useSearchParams();
  const next = search.get("next") || "/orders";

  const [mode, setMode] = useState<AuthMode>("phone");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<{ via: AuthMode; needsConfirm: boolean } | null>(
    null
  );

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < 6) {
      setError("পাসওয়ার্ড অন্তত ৬ অক্ষরের হতে হবে");
      return;
    }

    if (!isValidBdPhone(phone)) {
      setError("সঠিক বাংলাদেশি ফোন নম্বর দিন (যেমন: 01712345678)");
      return;
    }
    const phoneE164 = normalizeBdPhone(phone);

    setLoading(true);
    try {
      const supabase = createClient();

      // We always sign the user up via the EMAIL provider — even when
      // they pick "ফোন" mode. For phone-mode users we synthesise a
      // unique email from the phone (bd<digits>@phone.chapaimango.local)
      // so we don't need a paid SMS provider just to enable Supabase's
      // native phone auth. The real phone is preserved in user_metadata.
      const authEmail =
        mode === "email"
          ? email.trim().toLowerCase()
          : phoneToSyntheticEmail(phoneE164);

      const { data, error: signUpError } = await supabase.auth.signUp({
        email: authEmail,
        password,
        options: {
          data: {
            full_name: fullName,
            phone: phoneE164,
            email:
              mode === "email"
                ? email.trim().toLowerCase()
                : email
                  ? email.trim().toLowerCase()
                  : null,
            auth_method: mode
          }
        }
      });

      if (signUpError) {
        setError(signUpError.message);
        toast.error("সাইন আপ করতে পারিনি");
        return;
      }

      if (data.session) {
        toast.success("অ্যাকাউন্ট তৈরি! স্বাগতম।");
        window.location.href = next;
      } else {
        setDone({ via: mode, needsConfirm: true });
      }
    } catch (err) {
      console.error(err);
      setError("কিছু ভুল হয়েছে। আবার চেষ্টা করুন।");
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="text-center py-2">
        <CheckCircle2 className="h-14 w-14 mx-auto text-leaf-500" />
        <h2 className="font-display-bn text-xl font-bold mt-3">
          অ্যাকাউন্ট তৈরি হয়েছে!
        </h2>
        <p className="mt-2 text-sm text-ink/70 leading-relaxed">
          {done.via === "email" ? (
            <>
              আপনার ইমেইলে কনফার্মেশন লিঙ্ক পাঠিয়েছি। <strong>{email}</strong>{" "}
              চেক করুন এবং লিঙ্কে ক্লিক করুন।
            </>
          ) : (
            <>
              অ্যাকাউন্ট তৈরি হয়ে গেছে! &ldquo;Confirm email&rdquo; বন্ধ থাকলে
              এখনই ফোন + পাসওয়ার্ড দিয়ে সাইন ইন করতে পারবেন। অন থাকলে সাইট
              অ্যাডমিনকে বলুন এটি বন্ধ করে দিতে।
            </>
          )}
          <br />
          তারপর{" "}
          <a href="/login" className="text-mango-700 underline">
            সাইন ইন
          </a>{" "}
          করুন।
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-semibold text-ink/70 mb-2">
          কোন পদ্ধতিতে সাইন আপ করবেন?
        </label>
        <div className="grid grid-cols-2 gap-2">
          <ModeButton
            active={mode === "phone"}
            onClick={() => setMode("phone")}
            icon={<Smartphone className="h-4 w-4" />}
            label="ফোন"
          />
          <ModeButton
            active={mode === "email"}
            onClick={() => setMode("email")}
            icon={<Mail className="h-4 w-4" />}
            label="ইমেইল"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-ink/70 mb-1.5">
          পূর্ণ নাম *
        </label>
        <input
          type="text"
          required
          minLength={2}
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="input-field"
          placeholder="মোঃ রহিম উদ্দিন"
        />
      </div>

      {mode === "email" ? (
        <>
          <div>
            <label className="block text-xs font-semibold text-ink/70 mb-1.5">
              ইমেইল *
            </label>
            <input
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              placeholder="you@email.com"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-ink/70 mb-1.5">
              ফোন *{" "}
              <span className="font-normal text-ink/40">(ডেলিভারির জন্য)</span>
            </label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="input-field"
              placeholder="01712345678"
            />
          </div>
        </>
      ) : (
        <>
          <div>
            <label className="block text-xs font-semibold text-ink/70 mb-1.5">
              ফোন * <span className="font-normal text-ink/40">(BD নম্বর)</span>
            </label>
            <input
              type="tel"
              autoComplete="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="input-field"
              placeholder="01712345678"
            />
            <p className="mt-1 text-[11px] text-ink/50">
              এই ফোন নম্বর দিয়েই পরে সাইন ইন করবেন।
            </p>
          </div>
          <div>
            <label className="block text-xs font-semibold text-ink/70 mb-1.5">
              ইমেইল{" "}
              <span className="font-normal text-ink/40">(ঐচ্ছিক)</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              placeholder="you@email.com"
            />
          </div>
        </>
      )}

      <div>
        <label className="block text-xs font-semibold text-ink/70 mb-1.5">
          পাসওয়ার্ড *{" "}
          <span className="font-normal text-ink/40">(৬+ অক্ষর)</span>
        </label>
        <input
          type="password"
          autoComplete="new-password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="input-field"
          placeholder="••••••••"
        />
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <button type="submit" disabled={loading} className="btn-primary w-full">
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> তৈরি করছি...
          </>
        ) : (
          <>
            <UserPlus className="h-4 w-4" /> অ্যাকাউন্ট তৈরি করুন
          </>
        )}
      </button>
    </form>
  );
}

function ModeButton({
  active,
  onClick,
  icon,
  label
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center justify-center gap-2 rounded-xl border-2 px-3 py-2.5 text-sm font-semibold transition",
        active
          ? "border-mango-500 bg-mango-100 text-mango-700 shadow-glow"
          : "border-mango-200 bg-white text-ink/60 hover:border-mango-300"
      )}
    >
      {icon}
      {label}
    </button>
  );
}
