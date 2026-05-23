import type { Metadata } from "next";
import { Inter, Hind_Siliguri, Noto_Serif_Bengali } from "next/font/google";
import { Toaster } from "react-hot-toast";
import SiteShell from "@/components/layout/SiteShell";
import { getSiteUrl, SITE } from "@/lib/site";
import "./globals.css";

// Font diet — was 4 families × ~15 files. PageSpeed flagged this as the
// dominant LCP cost on mobile (Bengali fonts are large because the script
// has many ligatures). We now ship 3 families × 7 files: Inter for Latin
// body, Hind Siliguri for Bengali body, Noto Serif Bengali for the
// Bengali display headlines. English display falls back to Georgia.
const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
  variable: "--font-sans"
});
const hindSiliguri = Hind_Siliguri({
  subsets: ["bengali", "latin"],
  weight: ["400", "700"],
  display: "swap",
  variable: "--font-bangla"
});
const notoSerifBengali = Noto_Serif_Bengali({
  subsets: ["bengali"],
  weight: ["700"],
  display: "swap",
  // Make next/font subset a single weight from the variable font for
  // smaller payload, and `preload: true` (default) injects the
  // <link rel=preload> needed for the LCP H1.
  variable: "--font-bangla-display"
});

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  // metadataBase makes every relative og:image / canonical absolute.
  metadataBase: new URL(siteUrl),
  title: {
    default: `${SITE.name} — চাঁপাইনবাবগঞ্জের সেরা আম`,
    template: `%s — ${SITE.name}`
  },
  description: SITE.longDescription,
  applicationName: SITE.name,
  authors: [{ name: SITE.name, url: siteUrl }],
  creator: SITE.name,
  publisher: SITE.name,
  category: "shopping",
  keywords: [
    "Chapai Mango House",
    "চাঁপাই ম্যাঙ্গো",
    "চাঁপাইনবাবগঞ্জের আম",
    "চাঁপাইয়ের আম অনলাইনে",
    "আম অনলাইনে কিনুন",
    "Himsagar mango",
    "Langra mango",
    "Khirsapat mango",
    "Fazli mango",
    "Amrapali mango",
    "Gopalbhog mango",
    "buy mango online Bangladesh",
    "GI Khirsapat",
    "Nachole Chapainawabganj",
    "organic mango Bangladesh"
  ],
  alternates: {
    canonical: "/",
    languages: {
      "bn-BD": "/",
      "en-US": "/"
    }
  },
  openGraph: {
    type: "website",
    locale: SITE.defaultLocale,
    url: siteUrl,
    siteName: SITE.name,
    title: `${SITE.name} — চাঁপাইনবাবগঞ্জের সেরা আম`,
    description: SITE.shortDescription,
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: `${SITE.name} — চাঁপাইনবাবগঞ্জের গাছপাকা আম`
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE.name} — চাঁপাইনবাবগঞ্জের সেরা আম`,
    description: SITE.shortDescription,
    images: ["/opengraph-image"]
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1
    }
  },
  icons: {
    icon: "/favicon.ico"
  },
  // Search Console / Bing Webmaster verification.
  //
  // These tokens are NOT secrets — Google literally generates them so they
  // can be embedded in public HTML. Hard-coding avoids the NEXT_PUBLIC_*
  // build-time gotcha where adding the env var to Railway after the build
  // does nothing until the next rebuild.
  //
  // Env vars still take precedence (so future tokens / Bing / replatforms
  // can be done without a code change), but we ship a working default.
  verification: {
    google:
      process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ??
      "8UYqw1dQn90ujGaBBsXBh5_fXnefaXOHOC9wCyLvA3Q",
    other: process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION
      ? { "msvalidate.01": process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION }
      : undefined
  }
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="bn"
      className={`${inter.variable} ${hindSiliguri.variable} ${notoSerifBengali.variable}`}
    >
      <body className="min-h-screen bg-cream text-ink">
        <SiteShell>{children}</SiteShell>
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: "#fff7e8",
              color: "#1a0f00",
              border: "1px solid #ffdc80",
              fontFamily: "var(--font-bangla), var(--font-sans)"
            }
          }}
        />
      </body>
    </html>
  );
}
