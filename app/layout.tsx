import type { Metadata } from "next";
import {
  Inter,
  Playfair_Display,
  Hind_Siliguri,
  Noto_Serif_Bengali
} from "next/font/google";
import { Toaster } from "react-hot-toast";
import SiteShell from "@/components/layout/SiteShell";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-display"
});
const hindSiliguri = Hind_Siliguri({
  subsets: ["bengali", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-bangla"
});
const notoSerifBengali = Noto_Serif_Bengali({
  subsets: ["bengali"],
  weight: ["400", "600", "700"],
  variable: "--font-bangla-display"
});

export const metadata: Metadata = {
  title: "Chapai Mango House — চাঁপাইনবাবগঞ্জের সেরা আম",
  description:
    "চাঁপাইনবাবগঞ্জের গাছপাকা, কেমিক্যাল-মুক্ত আম সরাসরি আপনার দরজায়। হিমসাগর, ল্যাংড়া, ক্ষীরসাপাত, ফজলি, আম্রপালি, গোপালভোগ — সব জাত এক জায়গায়।",
  keywords: [
    "Chapai Mango House",
    "চাঁপাই ম্যাঙ্গো",
    "চাঁপাইনবাবগঞ্জের আম",
    "Himsagar",
    "Langra",
    "Khirsapat",
    "Fazli",
    "Amrapali",
    "buy mango online Bangladesh",
    "Nachole Chapainawabganj"
  ],
  openGraph: {
    title: "Chapai Mango House — চাঁপাইনবাবগঞ্জের সেরা আম",
    description:
      "নিজামপুর, নাচোল, চাঁপাইনবাবগঞ্জ থেকে সরাসরি আপনার দরজায়। অর্ডার করুন আজই।",
    type: "website",
    locale: "bn_BD"
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
      className={`${inter.variable} ${playfair.variable} ${hindSiliguri.variable} ${notoSerifBengali.variable}`}
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
