import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// GET /api/sessions/:id
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await prisma.session.findUnique({ where: { id } });

  if (!session) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  return NextResponse.json(session);
}

// DELETE /api/sessions/:id
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.session.delete({ where: { id } });
  return NextResponse.json({ success: true });
}

// PATCH /api/sessions/:id
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  const data: Record<string, unknown> = {};
  if (body.title !== undefined) data.title = body.title;
  if (body.mentor !== undefined) data.mentor = body.mentor;
  if (body.topic !== undefined) data.topic = body.topic;
  if (body.rawNotes !== undefined) data.rawNotes = body.rawNotes;
  if (body.date !== undefined) data.date = new Date(body.date);

  const session = await prisma.session.update({
    where: { id },
    data,
  });

  return NextResponse.json(session);
}
