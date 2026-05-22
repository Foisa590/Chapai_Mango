import { Phone, Mail, MapPin, Clock } from "lucide-react";
import ContactForm from "@/components/contact/ContactForm";

export const metadata = {
  title: "Contact — Chapai Mango",
  description: "Amader sathe jogajog korun — order, delivery, ba ono kichu."
};

export default function ContactPage() {
  const phone = process.env.NEXT_PUBLIC_BUSINESS_PHONE || "+880 1XXX-XXXXXX";
  const email = process.env.NEXT_PUBLIC_BUSINESS_EMAIL || "hello@chapaimango.com";

  return (
    <>
      <section className="bg-hero-radial">
        <div className="container-x py-16 text-center max-w-3xl mx-auto">
          <p className="text-sm font-semibold text-mango-600 mb-2">━ Contact</p>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
            Amader sathe <span className="shimmer-text">jogajog korun</span>
          </h1>
          <p className="mt-5 text-ink/70 text-lg">
            Order, delivery, ba ono kichu — amra ache i. Phone, email, ba form.
          </p>
        </div>
      </section>

      <section className="container-x py-14 grid lg:grid-cols-3 gap-8">
        <div className="space-y-4">
          <InfoCard
            icon={<Phone className="h-5 w-5" />}
            title="Phone / WhatsApp"
            value={phone}
            href={`tel:${phone}`}
          />
          <InfoCard
            icon={<Mail className="h-5 w-5" />}
            title="Email"
            value={email}
            href={`mailto:${email}`}
          />
          <InfoCard
            icon={<MapPin className="h-5 w-5" />}
            title="Bagan / Office"
            value="Chapainawabganj, Rajshahi, Bangladesh"
          />
          <InfoCard
            icon={<Clock className="h-5 w-5" />}
            title="Customer support"
            value="Shokal 9 — Rat 9 (Daily)"
          />
        </div>

        <div className="lg:col-span-2 glass rounded-3xl p-6 sm:p-8">
          <h2 className="font-display text-2xl font-bold mb-1">
            Message likhun
          </h2>
          <p className="text-sm text-ink/60 mb-6">
            Form fill up korle amra 24 ghonta-r moddhe contact korbo.
          </p>
          <ContactForm />
        </div>
      </section>

      {/* Map embed (Chapainawabganj) */}
      <section className="container-x pb-16">
        <div className="rounded-3xl overflow-hidden glass">
          <iframe
            src="https://www.google.com/maps?q=Chapainawabganj,Bangladesh&output=embed"
            className="w-full h-[360px] border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Chapainawabganj location"
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
        <div>
          <div className="text-xs uppercase tracking-wider font-semibold text-mango-600">
            {title}
          </div>
          <div className="text-sm font-medium text-ink mt-1 break-all">
            {value}
          </div>
        </div>
      </div>
    </div>
  );
  return href ? <a href={href}>{Body}</a> : Body;
}
