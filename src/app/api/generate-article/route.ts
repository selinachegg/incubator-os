import { generateArticle } from "@/lib/ai";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// POST /api/generate-article { sessionId, title, rawNotes, summary, keyInsights, mentor, topic }
export async function POST(request: NextRequest) {
  const { sessionId, title, rawNotes, summary, keyInsights, mentor, topic } =
    await request.json();

  if (!rawNotes) {
    return NextResponse.json({ error: "No notes provided" }, { status: 400 });
  }

  try {
    const article = await generateArticle({
      title,
      rawNotes,
      summary,
      keyInsights,
      mentor,
      topic,
    });

    // Save article to session if sessionId provided
    if (sessionId) {
      await prisma.session.update({
        where: { id: sessionId },
        data: { article },
      });
    }

    return NextResponse.json({ article });
  } catch (error) {
    const msg =
      error instanceof Error ? error.message : "Article generation failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
