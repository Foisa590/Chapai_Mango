import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import Sidebar from "@/components/admin/Sidebar";

export const metadata = {
  title: "Admin — Chapai Mango",
  robots: { index: false, follow: false }
};

export default async function AdminLayout({
  children
}: {
  children: React.ReactNode;
}) {
  // Login page renders standalone (no sidebar) — middleware allows
  // unauthenticated access to /admin/login only. Detecting "no user" here
  // makes the login page render without the chrome.
  let email: string | null = null;
  if (isSupabaseConfigured()) {
    const supabase = createClient();
    const { data } = await supabase.auth.getUser();
    email = data.user?.email ?? null;
  }

  if (!email) {
    // Login screen / unconfigured state — full-bleed layout
    return <div className="min-h-screen bg-cream">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-cream lg:flex">
      <Sidebar email={email} />
      <div className="flex-1 min-w-0">
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">{children}</div>
      </div>
    </div>
  );
}
