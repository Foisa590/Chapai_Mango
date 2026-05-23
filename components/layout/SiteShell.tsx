"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import Footer from "./Footer";
import TopMarquee from "@/components/promo/TopMarquee";
import FloatingWhatsApp from "@/components/whatsapp/FloatingWhatsApp";

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
