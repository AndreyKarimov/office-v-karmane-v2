"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { sanitizeInput, chat } from "@/lib/llm-provider";
import { getOrCreateAIManagerUser, createAICComment } from "@/lib/comment-actions";

export type AICoworkerData = {
  id: string;
  name: string;
  role: string;
  skills: string;
  llmModel: string;
  status: string;
  _count: { subtasks: number };
};

export async function getAICoworkers(): Promise<AICoworkerData[]> {
  const session = await auth();
  if (!session?.user?.id) return [];

  const membership = await prisma.tenantMember.findFirst({
    where: { userId: session.user.id },
  });
  if (!membership) return [];

  return prisma.aICoworker.findMany({
    where: { tenantId: membership.tenantId },
    include: { _count: { select: { subtasks: true } } },
    orderBy: { createdAt: "asc" },
  });
}

export async function hireAICoworker(input: {
  name: string;
  role: string;
  skills: string;
  systemPrompt: string;
  llmModel?: string;
}): Promise<{ success: boolean; coworker?: AICoworkerData; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };

  const membership = await prisma.tenantMember.findFirst({
    where: { userId: session.user.id },
  });
  if (!membership) return { success: false, error: "No tenant" };

  if (!input.name.trim()) return { success: false, error: "Name is required" };
  if (!input.role.trim()) return { success: false, error: "Role is required" };

  const name = sanitizeInput(input.name.trim());
  const role = sanitizeInput(input.role.trim());
  const systemPrompt = sanitizeInput(input.systemPrompt.trim());
  const skills = sanitizeInput(input.skills.trim());

  const coworker = await prisma.aICoworker.create({
    data: {
      name,
      role,
      systemPrompt,
      skills: JSON.stringify(skills.split(",").map((s) => s.trim()).filter(Boolean)),
      llmModel: input.llmModel || "openrouter/free",
      status: "IDLE",
      tenantId: membership.tenantId,
      userId: session.user.id,
    },
    include: { _count: { select: { subtasks: true } } },
  });

  revalidatePath("/team");
  revalidatePath("/dashboard");

  return { success: true, coworker };
}

export async function getCoworkerQueue(
  coworkerId: string,
): Promise<{
  id: string;
  title: string;
  status: string;
  taskId: string;
  taskTitle: string;
  createdAt: Date;
}[]> {
  const session = await auth();
  if (!session?.user?.id) return [];

  return prisma.subtask.findMany({
    where: {
      assigneeId: coworkerId,
      status: { in: ["TODO", "IN_PROGRESS"] },
    },
    include: {
      task: { select: { title: true } },
    },
    orderBy: [{ status: "asc" }, { createdAt: "asc" }],
    take: 20,
  }).then((subtasks) =>
    subtasks.map((s) => ({
      id: s.id,
      title: s.title,
      status: s.status,
      taskId: s.taskId,
      taskTitle: s.task.title,
      createdAt: s.createdAt,
    })),
  );
}

export async function executeSubtask(
  subtaskId: string,
): Promise<{ success: boolean; result?: string; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };

  const subtask = await prisma.subtask.findUnique({
    where: { id: subtaskId },
    include: { assignee: true, task: true },
  });

  if (!subtask) return { success: false, error: "Subtask not found" };
  if (!subtask.assignee) return { success: false, error: "No assignee" };

  await prisma.subtask.update({
    where: { id: subtaskId },
    data: { status: "IN_PROGRESS" },
  });

  try {
    const result = await chat(
      subtask.assignee.systemPrompt,
      `Выполни следующую подзадачу в рамках общей задачи "${sanitizeInput(subtask.task.title)}":\n\n${sanitizeInput(subtask.description || subtask.title)}\n\nПредоставь результат в структурированном виде.`,
    );

    await prisma.subtask.update({
      where: { id: subtaskId },
      data: { status: "DONE" },
    });

    const aiUserId = await getOrCreateAIManagerUser();
    await createAICComment(
      subtask.taskId,
      `✅ Подзадача «${subtask.title}» выполнена.\n\nРезультат:\n${result.slice(0, 1000)}`,
      aiUserId,
    );

    revalidatePath(`/tasks/${subtask.taskId}`);
    revalidatePath("/team");

    return { success: true, result };
  } catch (err) {
    await prisma.subtask.update({
      where: { id: subtaskId },
      data: { status: "TODO" },
    });
    return {
      success: false,
      error: err instanceof Error ? err.message : "Execution failed",
    };
  }
}

export async function assignSubtaskToCoworker(
  subtaskId: string,
  coworkerId: string,
): Promise<{ success: boolean; message: string }> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, message: "Unauthorized" };

  await prisma.subtask.update({
    where: { id: subtaskId },
    data: { assigneeId: coworkerId },
  });

  revalidatePath("/team");
  return { success: true, message: "Subtask assigned" };
}
