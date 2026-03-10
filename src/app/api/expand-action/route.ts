import { expandAction } from "@/lib/ai";
import { NextRequest, NextResponse } from "next/server";

// POST /api/expand-action { actionItem, sessionContext }
export async function POST(request: NextRequest) {
  const { actionItem, sessionContext } = await request.json();

  if (!actionItem) {
    return NextResponse.json(
      { error: "No action item provided" },
      { status: 400 }
    );
  }

  try {
    const expanded = await expandAction(actionItem, sessionContext || "");
    return NextResponse.json({ expanded });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Expansion failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
