import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// GET /api/actions
export async function GET() {
  const actions = await prisma.actionItem.findMany({
    include: { session: { select: { title: true, mentor: true, topic: true } } },
    orderBy: [{ completed: "asc" }, { priority: "asc" }, { createdAt: "desc" }],
  });
  return NextResponse.json(actions);
}

// POST /api/actions — create a new action item
export async function POST(request: NextRequest) {
  const body = await request.json();

  const action = await prisma.actionItem.create({
    data: {
      text: body.text,
      sessionId: body.sessionId,
      priority: body.priority || "medium",
      dueDate: body.dueDate ? new Date(body.dueDate) : null,
      notes: body.notes || null,
    },
  });

  return NextResponse.json(action, { status: 201 });
}
