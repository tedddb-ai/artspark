import { NextResponse } from "next/server";

/**
 * Simple API key check for routes that call Claude (cost protection).
 * Set APP_SECRET in env. Client sends it via x-app-key header.
 * Returns null if authorized, or a 401 NextResponse if not.
 */
export function checkAuth(request: Request): NextResponse | null {
  const secret = process.env.APP_SECRET;
  if (!secret) return null; // No secret configured = open access (dev mode)

  const provided = request.headers.get("x-app-key");
  if (provided === secret) return null;

  return NextResponse.json(
    { error: "Unauthorized" },
    { status: 401 }
  );
}

/** Headers to include in client-side fetch calls to protected routes */
export function authHeaders(): Record<string, string> {
  const key = process.env.NEXT_PUBLIC_APP_SECRET;
  if (!key) return {};
  return { "x-app-key": key };
}
