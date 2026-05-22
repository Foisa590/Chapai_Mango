import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { Toaster } from "react-hot-toast";
import SiteShell from "@/components/layout/SiteShell";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-display"
});

export const metadata: Metadata = {
  title: "Chapai Mango — Premium Aam from Chapainawabganj",
  description:
    "Direct from Chapainawabganj farms. Himsagar, Langra, Khirsapat, Fazli, Amrapali, Gopalbhog — fresh, chemical-free, doorstep delivery across Bangladesh.",
  keywords: [
    "Chapai Mango",
    "Chapainawabganj aam",
    "Himsagar",
    "Langra",
    "Khirsapat",
    "buy mango online Bangladesh"
  ],
  openGraph: {
    title: "Chapai Mango — Premium Aam from Chapainawabganj",
    description:
      "Direct from farm to your doorstep. Order Chapai-er aam online.",
    type: "website"
  }
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="min-h-screen bg-cream text-ink">
        <SiteShell>{children}</SiteShell>
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: "#fff7e8",
              color: "#1a0f00",
              border: "1px solid #ffdc80",
              fontFamily: "var(--font-sans)"
            }
          }}
        />
      </body>
    </html>
  );
}
