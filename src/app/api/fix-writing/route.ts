import { fixWriting } from "@/lib/ai";
import { NextRequest, NextResponse } from "next/server";

// POST /api/fix-writing { text, isHtml? }
export async function POST(request: NextRequest) {
  const { text, isHtml } = await request.json();

  if (!text || typeof text !== "string" || text.trim().length === 0) {
    return NextResponse.json({ error: "No text provided" }, { status: 400 });
  }

  try {
    const fixed = await fixWriting(text, !!isHtml);
    return NextResponse.json({ fixed });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Writing fix failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
