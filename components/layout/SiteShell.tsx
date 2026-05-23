"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import Footer from "./Footer";
import TopMarquee from "@/components/promo/TopMarquee";

// FloatingWhatsApp is below-the-fold decoration — lazy-load it so its
// JS doesn't compete with the hero's first paint.
const FloatingWhatsApp = dynamic(
  () => import("@/components/whatsapp/FloatingWhatsApp"),
  { ssr: false }
);

/**
 * Wraps the app with public Navbar + Footer, except on /admin routes
 * which use their own admin layout.
 */
export default function SiteShell({
  children
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <>
      <TopMarquee />
      <Navbar />
      <main className="page-enter">{children}</main>
      <Footer />
      <FloatingWhatsApp />
    </>
  );
}
