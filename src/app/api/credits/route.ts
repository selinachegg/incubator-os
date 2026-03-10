import { NextResponse } from "next/server";
import { getAIConfig } from "@/lib/ai";

export async function GET() {
  const config = await getAIConfig();

  if (!config.apiKey) {
    return NextResponse.json({ credits: null, provider: config.provider });
  }

  try {
    if (config.provider === "openrouter") {
      const res = await fetch("https://openrouter.ai/api/v1/auth/key", {
        headers: { Authorization: `Bearer ${config.apiKey}` },
      });
      if (res.ok) {
        const data = await res.json();
        return NextResponse.json({
          provider: "openrouter",
          credits: data.data?.limit != null
            ? `$${(data.data.usage ?? 0).toFixed(4)} used of $${data.data.limit.toFixed(2)} limit`
            : `$${(data.data?.usage ?? 0).toFixed(4)} used`,
          remaining: data.data?.limit != null
            ? `$${(data.data.limit - (data.data.usage ?? 0)).toFixed(4)} remaining`
            : null,
        });
      }
    }

    // For Gemini and Anthropic, we can't easily check credits via API
    return NextResponse.json({
      provider: config.provider,
      credits: config.provider === "gemini" ? "Free tier (rate limited)" : "Check console.anthropic.com",
    });
  } catch {
    return NextResponse.json({ credits: null, provider: config.provider });
  }
}
