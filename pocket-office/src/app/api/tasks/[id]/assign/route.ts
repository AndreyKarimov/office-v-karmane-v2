import { NextResponse } from "next/server";
import { assignTask } from "@/lib/ai-manager-actions";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const assigneeId = body.assigneeId;
  if (!assigneeId) {
    return NextResponse.json({ error: "assigneeId is required" }, { status: 400 });
  }
  const result = await assignTask(id, assigneeId);
  if (!result.success) {
    return NextResponse.json({ error: result.message }, { status: 400 });
  }
  return NextResponse.json({ success: true, message: result.message });
}
