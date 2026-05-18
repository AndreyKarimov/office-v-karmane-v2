import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import {
  generatePlan,
  sanitizeInput,
} from "@/lib/llm-provider";
import { getComments, getOrCreateAIManagerUser, createAICComment } from "@/lib/comment-actions";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const task = await prisma.task.findUnique({ where: { id } });
    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    if (task.status !== "ANALYZING") {
      return NextResponse.json(
        { error: "Task must be in ANALYZING status" },
        { status: 400 },
      );
    }

    const comments = await getComments(id);
    const qaHistory: { question: string; answer: string }[] = [];

    for (let i = 0; i < comments.length - 1; i++) {
      if (comments[i].isAI && comments[i].content.includes("Уточняющие вопросы")) {
        const nextUserComment = comments
          .slice(i + 1)
          .find((c) => !c.isAI);
        if (nextUserComment) {
          qaHistory.push({
            question: "Clarification question",
            answer: nextUserComment.content,
          });
        }
      }
    }

    const title = sanitizeInput(task.title);
    const description = sanitizeInput(task.description || "");

    const result = await generatePlan(title, description, qaHistory);

    if (!result.success || !result.data) {
      return NextResponse.json(
        { error: "Failed to generate plan" },
        { status: 500 },
      );
    }

    const plan = result.data as {
      subtasks: {
        title: string;
        description: string;
        assigneeRole: string;
        estimatedHours: number;
        dependencies: string[];
      }[];
      summary: string;
    };

    await prisma.task.update({
      where: { id },
      data: {
        plan: JSON.stringify(plan),
        status: "PENDING_APPROVAL",
      },
    });

    await prisma.taskLog.create({
      data: {
        taskId: id,
        fromStatus: "ANALYZING",
        toStatus: "PENDING_APPROVAL",
      },
    });

    for (let i = 0; i < plan.subtasks.length; i++) {
      const st = plan.subtasks[i];
      await prisma.subtask.create({
        data: {
          title: st.title,
          description: st.description,
          status: "TODO",
          taskId: id,
          sortOrder: i,
        },
      });
    }

    const aiUserId = await getOrCreateAIManagerUser();
    const subtaskList = plan.subtasks
      .map(
        (st, i) =>
          `${i + 1}. **${st.title}** — ${st.estimatedHours}ч, ${st.assigneeRole}`,
      )
      .join("\n");

    await createAICComment(
      id,
      `📋 **План выполнения сгенерирован**\n\n${plan.summary}\n\n**Подзадачи:**\n${subtaskList}`,
      aiUserId,
    );

    return NextResponse.json({ success: true, plan });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal error" },
      { status: 500 },
    );
  }
}
