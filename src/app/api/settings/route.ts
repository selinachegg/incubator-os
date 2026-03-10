import { NextRequest, NextResponse } from "next/server";
import { getAIConfig, saveAIConfig, AIProvider } from "@/lib/ai";

export async function GET() {
  const config = await getAIConfig();
  const maskedKey = config.apiKey
    ? config.apiKey.slice(0, 10) + "..." + config.apiKey.slice(-4)
    : "";
  return NextResponse.json({
    provider: config.provider,
    apiKey: maskedKey,
    hasKey: !!config.apiKey,
    model: config.model,
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  const provider = body.provider as AIProvider;
  if (!["anthropic", "gemini", "openrouter"].includes(provider)) {
    return NextResponse.json({ error: "Invalid provider" }, { status: 400 });
  }

  if (!body.apiKey || body.apiKey === "__keep__") {
    return NextResponse.json({ error: "API key required" }, { status: 400 });
  }

  try {
    await saveAIConfig({
      provider,
      apiKey: body.apiKey,
      model: body.model || undefined,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Settings POST] Save error:", error);
    return NextResponse.json({ error: "Failed to save settings" }, { status: 500 });
  }
}
