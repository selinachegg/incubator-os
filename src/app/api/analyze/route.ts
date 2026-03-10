import { prisma } from "@/lib/prisma";
import { analyzeNotes } from "@/lib/ai";
import { NextRequest, NextResponse } from "next/server";

// POST /api/analyze { sessionId }
export async function POST(request: NextRequest) {
  const { sessionId } = await request.json();

  const session = await prisma.session.findUnique({
    where: { id: sessionId },
  });

  if (!session) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  try {
    // Strip HTML tags for AI analysis
    const plainText = session.rawNotes
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    const analysis = await analyzeNotes(plainText);

    const updated = await prisma.session.update({
      where: { id: sessionId },
      data: {
        summary: analysis.summary,
        keyInsights: JSON.stringify(analysis.key_insights),
        actionItems: JSON.stringify(analysis.action_items),
        tags: JSON.stringify(analysis.tags),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Analysis failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
