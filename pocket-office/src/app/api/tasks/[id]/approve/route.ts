import { NextResponse } from "next/server";
import { approvePlan } from "@/lib/ai-manager-actions";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const result = await approvePlan(id);
  if (!result.success) {
    return NextResponse.json({ error: result.message }, { status: 400 });
  }
  return NextResponse.json({ success: true, message: result.message });
}
