import { NextResponse, type NextRequest } from "next/server";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";

/**
 * OAuth callback handler for Supabase social providers (e.g. Google).
 *
 * Flow:
 *   1. User clicks "Continue with Google" on /login or /signup.
 *   2. Browser hits Supabase -> Google -> Supabase, then is redirected
 *      back here with a `?code=...` query param.
 *   3. We exchange that code for a session cookie and bounce the user
 *      to the original `next` destination (defaults to /orders).
 */
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") || "/orders";

  // Only follow same-origin redirects to avoid open-redirect abuse.
  const safeNext = next.startsWith("/") ? next : "/orders";

  if (code && isSupabaseConfigured()) {
    const supabase = createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(new URL(safeNext, url.origin));
    }
    // Surface the provider error on the login page so the user sees it.
    const failed = new URL("/login", url.origin);
    failed.searchParams.set("error", error.message);
    return NextResponse.redirect(failed);
  }

  // Missing code or Supabase not configured -> back to login.
  return NextResponse.redirect(new URL("/login", url.origin));
}
