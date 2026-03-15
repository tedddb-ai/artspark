export function safeJsonParse<T = unknown>(
  text: string
): { ok: true; data: T } | { ok: false; error: string } {
  try {
    const data = JSON.parse(text) as T;
    return { ok: true, data };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Invalid JSON",
    };
  }
}
