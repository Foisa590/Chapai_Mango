"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import Footer from "./Footer";

// FloatingWhatsApp is below-the-fold decoration — lazy-load it so its
// JS doesn't compete with the hero's first paint.
const FloatingWhatsApp = dynamic(
  () => import("@/components/whatsapp/FloatingWhatsApp"),
  { ssr: false }
);

/**
 * Wraps the app with public Navbar + Footer, except on /admin routes
 * which use their own admin layout.
 *
 * `topMarquee` is rendered as a slot so the parent layout can pass an
 * async server component (TopMarquee fetches from Supabase) — this
 * client component can't import the server-only data layer itself.
 */
export default function SiteShell({
  children,
  topMarquee
}: {
  children: React.ReactNode;
  topMarquee?: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <>
      {topMarquee}
      <Navbar />
      <main className="page-enter">{children}</main>
      <Footer />
      <FloatingWhatsApp />
    </>
  );
}
