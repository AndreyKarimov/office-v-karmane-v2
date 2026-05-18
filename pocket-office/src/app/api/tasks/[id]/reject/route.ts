import { NextResponse } from "next/server";
import { rejectPlan } from "@/lib/ai-manager-actions";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const reason = body.reason || "No reason provided";
  const result = await rejectPlan(id, reason);
  if (!result.success) {
    return NextResponse.json({ error: result.message }, { status: 400 });
  }
  return NextResponse.json({ success: true, message: result.message });
}
