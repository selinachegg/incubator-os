import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// GET /api/sessions?q=search+term
export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim();

  const sessions = await prisma.session.findMany({
    where: q
      ? {
          OR: [
            { title: { contains: q } },
            { mentor: { contains: q } },
            { topic: { contains: q } },
            { tags: { contains: q } },
          ],
        }
      : undefined,
    orderBy: { date: "desc" },
  });

  return NextResponse.json(sessions);
}

// POST /api/sessions
export async function POST(request: NextRequest) {
  const body = await request.json();

  const session = await prisma.session.create({
    data: {
      title: body.title,
      date: new Date(body.date),
      mentor: body.mentor,
      topic: body.topic,
      rawNotes: body.rawNotes,
    },
  });

  return NextResponse.json(session, { status: 201 });
}
