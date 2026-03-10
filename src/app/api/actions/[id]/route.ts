import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// PATCH /api/actions/:id — toggle completed, update priority, etc.
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  const data: Record<string, unknown> = {};
  if (body.completed !== undefined) data.completed = body.completed;
  if (body.priority !== undefined) data.priority = body.priority;
  if (body.text !== undefined) data.text = body.text;
  if (body.notes !== undefined) data.notes = body.notes;
  if (body.dueDate !== undefined)
    data.dueDate = body.dueDate ? new Date(body.dueDate) : null;

  const action = await prisma.actionItem.update({ where: { id }, data });
  return NextResponse.json(action);
}

// DELETE /api/actions/:id
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.actionItem.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
