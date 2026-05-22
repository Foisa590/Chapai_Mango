/**
 * Bangladeshi phone-number helpers used by the auth forms (Supabase
 * needs phone numbers in E.164 format, e.g. +8801712345678).
 *
 *   01712345678        -> +8801712345678
 *   1712345678         -> +8801712345678
 *   8801712345678      -> +8801712345678
 *   +8801712345678     -> +8801712345678 (unchanged)
 *
 * Anything that doesn't look like a BD phone is returned as-is so the
 * caller's validation can flag it.
 */
export function normalizeBdPhone(input: string): string {
  if (!input) return input;
  const cleaned = input.trim().replace(/[\s\-()]/g, "");
  if (cleaned.startsWith("+")) return cleaned;
  if (cleaned.startsWith("00880")) return "+" + cleaned.slice(2);
  if (cleaned.startsWith("880")) return "+" + cleaned;
  if (cleaned.startsWith("01") && cleaned.length === 11) {
    return "+880" + cleaned.slice(1);
  }
  if (cleaned.startsWith("1") && cleaned.length === 10) {
    return "+880" + cleaned;
  }
  return cleaned;
}

/**
 * Loose validation — true when the input normalises to a +880 number
 * with the expected 13 digits (country code + 10-digit subscriber).
 */
export function isValidBdPhone(input: string): boolean {
  const e164 = normalizeBdPhone(input);
  return /^\+8801\d{9}$/.test(e164);
}

/**
 * Pretty-print a phone for the UI: +8801712345678 -> 01712-345678.
 * Falls back to the raw input if it doesn't look BD.
 */
export function formatBdPhone(input: string | null | undefined): string {
  if (!input) return "";
  const e164 = normalizeBdPhone(input);
  const m = e164.match(/^\+880(1\d{4})(\d{6})$/);
  if (!m) return input;
  return `${m[1]}-${m[2]}`;
}

/**
 * Synthetic email used when a customer signs up with a phone number.
 *
 * Supabase's native Phone provider needs a paid SMS gateway (Twilio /
 * MessageBird / etc.) — overkill for a launch. So we keep using the
 * Email provider and derive a deterministic "fake" email from the
 * phone number. The real phone is also stored in user_metadata.phone
 * so checkout / orders can show it nicely.
 *
 * Format: bd<13-digit-E164-without-plus>@phone.chapaimango.local
 *   01712345678  ->  bd8801712345678@phone.chapaimango.local
 *
 * The .local TLD is reserved (RFC 6762) so the address is guaranteed
 * to never reach a real inbox; that's fine because email confirmation
 * is turned off on the project. Login resolves the same email from
 * the entered phone, so the customer never sees this string.
 */
export const PHONE_EMAIL_DOMAIN = "phone.chapaimango.local";

export function phoneToSyntheticEmail(phone: string): string {
  const e164 = normalizeBdPhone(phone);
  const digits = e164.replace(/^\+/, "");
  return `bd${digits}@${PHONE_EMAIL_DOMAIN}`;
}

/** True if the email looks like one we generated for a phone account. */
export function isSyntheticPhoneEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return email.endsWith(`@${PHONE_EMAIL_DOMAIN}`);
}
