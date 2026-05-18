import { NextResponse } from "next/server";
import { getAICoworkers } from "@/lib/ai-coworker-actions";

export async function GET() {
  const coworkers = await getAICoworkers();
  return NextResponse.json(coworkers);
}
