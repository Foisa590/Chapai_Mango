import { Phone, Mail, MapPin, Clock } from "lucide-react";
import ContactForm from "@/components/contact/ContactForm";

export const metadata = {
  title: "যোগাযোগ — Chapai Mango House",
  description:
    "Chapai Mango House-এর সাথে যোগাযোগ করুন — অর্ডার, ডেলিভারি বা যে কোনো প্রশ্নে।"
};

export default function ContactPage() {
  const phone = process.env.NEXT_PUBLIC_BUSINESS_PHONE || "+880 1XXX-XXXXXX";
  const email =
    process.env.NEXT_PUBLIC_BUSINESS_EMAIL || "hello@chapaimangohouse.com";

  return (
    <>
      <section className="bg-hero-radial">
        <div className="container-x py-16 text-center max-w-3xl mx-auto">
          <p className="text-sm font-semibold text-mango-600 mb-2">━ যোগাযোগ</p>
          <h1 className="font-display-bn text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">
            আমাদের সাথে <span className="shimmer-text">যোগাযোগ করুন</span>
          </h1>
          <p className="mt-5 text-ink/70 text-base sm:text-lg">
            অর্ডার, ডেলিভারি বা যে কোনো প্রশ্ন — আমরা সবসময় পাশে আছি। ফোন,
            ইমেইল অথবা ফর্ম পূরণ করুন।
          </p>
        </div>
      </section>

      <section className="container-x py-14 grid lg:grid-cols-3 gap-8">
        <div className="space-y-4">
          <InfoCard
            icon={<Phone className="h-5 w-5" />}
            title="ফোন / WhatsApp"
            value={phone}
            href={`tel:${phone}`}
          />
          <InfoCard
            icon={<Mail className="h-5 w-5" />}
            title="ইমেইল"
            value={email}
            href={`mailto:${email}`}
          />
          <InfoCard
            icon={<MapPin className="h-5 w-5" />}
            title="বাগান / অফিস"
            value="নিজামপুর, নাচোল, চাঁপাইনবাবগঞ্জ, রাজশাহী, বাংলাদেশ"
          />
          <InfoCard
            icon={<Clock className="h-5 w-5" />}
            title="কাস্টমার সাপোর্ট"
            value="সকাল ৯টা — রাত ৯টা (প্রতিদিন)"
          />
        </div>

        <div className="lg:col-span-2 glass rounded-3xl p-6 sm:p-8">
          <h2 className="font-display-bn text-xl sm:text-2xl font-bold mb-1">
            মেসেজ লিখুন
          </h2>
          <p className="text-sm text-ink/60 mb-6">
            ফর্ম পূরণ করলে আমরা ২৪ ঘণ্টার মধ্যে যোগাযোগ করব।
          </p>
          <ContactForm />
        </div>
      </section>

      {/* Map embed (Nachole, Chapainawabganj) */}
      <section className="container-x pb-16">
        <div className="rounded-3xl overflow-hidden glass">
          <iframe
            src="https://www.google.com/maps?q=Nijampur,Nachole,Chapainawabganj,Bangladesh&output=embed"
            className="w-full h-[360px] border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="নিজামপুর, নাচোল, চাঁপাইনবাবগঞ্জ"
          />
        </div>
      </section>
    </>
  );
}

function InfoCard({
  icon,
  title,
  value,
  href
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  href?: string;
}) {
  const Body = (
    <div className="glass rounded-2xl p-5 hover:shadow-glow transition-shadow">
      <div className="flex items-start gap-4">
        <div className="grid place-items-center h-10 w-10 rounded-xl bg-mango-gradient shrink-0">
          {icon}
        </div>
        <div className="min-w-0">
          <div className="text-xs uppercase tracking-wider font-semibold text-mango-600">
            {title}
          </div>
          <div className="text-sm font-medium text-ink mt-1 break-words">
            {value}
          </div>
        </div>
      </div>
    </div>
  );
  return href ? <a href={href}>{Body}</a> : Body;
}
