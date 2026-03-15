import { cookies } from "next/headers";
import { v4 as uuidv4 } from "uuid";

const SESSION_COOKIE = "artspark_sid";

/** Get session ID from cookies, or generate a new one */
export async function getSessionId(): Promise<{ sid: string; isNew: boolean }> {
  const cookieStore = await cookies();
  const existing = cookieStore.get(SESSION_COOKIE)?.value;
  if (existing) return { sid: existing, isNew: false };
  return { sid: uuidv4(), isNew: true };
}

/** Cookie header string for setting session ID on new sessions */
export function sessionCookieHeader(sid: string): string {
  return `${SESSION_COOKIE}=${sid}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 24 * 365}`;
}
