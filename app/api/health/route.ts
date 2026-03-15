import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export async function GET() {
  const start = Date.now();
  const checks: Record<string, string> = {};

  // Check env vars
  checks.ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY ? `set (${process.env.ANTHROPIC_API_KEY.length} chars)` : "MISSING";
  checks.TURSO_DATABASE_URL = process.env.TURSO_DATABASE_URL ? `set (${process.env.TURSO_DATABASE_URL.trim().length} chars)` : "MISSING";
  checks.APP_SECRET = process.env.APP_SECRET ? "set" : "not set";
  checks.NEXT_PUBLIC_APP_SECRET = process.env.NEXT_PUBLIC_APP_SECRET ? "set" : "not set";

  // Quick API test
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY?.trim();
    if (apiKey) {
      const anthropic = new Anthropic({ apiKey });
      const t = Date.now();
      const res = await anthropic.messages.create({
        model: "claude-sonnet-4-6",
        max_tokens: 50,
        messages: [{ role: "user", content: "Say 'ok' in JSON: {\"status\":\"ok\"}" }],
      });
      checks.anthropic_api = `OK (${Date.now() - t}ms)`;
      checks.anthropic_response = res.content[0].type === "text" ? res.content[0].text.slice(0, 100) : "no text";
    }
  } catch (e) {
    checks.anthropic_api = `ERROR: ${e instanceof Error ? e.message : String(e)}`;
  }

  checks.total_ms = `${Date.now() - start}ms`;
  return NextResponse.json(checks);
}
