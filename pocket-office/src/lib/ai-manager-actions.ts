"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import {
  analyzeTask,
  generateClarifyingQuestions,
  generatePlan,
  sanitizeInput,
} from "@/lib/llm-provider";
import {
  createAICComment,
  getComments,
  getOrCreateAIManagerUser,
} from "@/lib/comment-actions";

export async function runAIAnalysis(taskId: string): Promise<{
  success: boolean;
  status: string;
  message: string;
}> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, status: "error", message: "Unauthorized" };

  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task) return { success: false, status: "error", message: "Task not found" };

  if (task.status !== "BACKLOG") {
    return { success: false, status: "error", message: "Task must be in BACKLOG to analyze" };
  }

  await prisma.task.update({
    where: { id: taskId },
    data: { status: "ANALYZING" },
  });

  await prisma.taskLog.create({
    data: {
      taskId,
      fromStatus: "BACKLOG",
      toStatus: "ANALYZING",
      userId: session.user.id,
    },
  });

  const aiUserId = await getOrCreateAIManagerUser();
  await createAICComment(
    taskId,
    "🔍 ИИ-Менеджер анализирует задачу, пожалуйста, подождите...",
    aiUserId,
  );

  const title = sanitizeInput(task.title);
  const description = sanitizeInput(task.description || "");

  const analysis = await analyzeTask(title, description);

  revalidatePath(`/tasks/${taskId}`);
  revalidatePath("/dashboard");

  if (!analysis.success || !analysis.data) {
    return { success: false, status: "ANALYZING", message: "Analysis failed, retry later" };
  }

  const data = analysis.data as {
    actions: string[];
    resources: string[];
    risks: string[];
    dependencies: string[];
    needsClarification: boolean;
    clarificationQuestions: string[];
  };

  const analysisMessage = [
    "📊 **Анализ задачи завершён**",
    "",
    data.actions.length > 0 ? `**Действия:**\n${data.actions.map((a: string) => `- ${a}`).join("\n")}` : "",
    data.resources.length > 0 ? `\n**Ресурсы:**\n${data.resources.map((r: string) => `- ${r}`).join("\n")}` : "",
    data.risks.length > 0 ? `\n**Риски:**\n${data.risks.map((r: string) => `- ${r}`).join("\n")}` : "",
    data.dependencies.length > 0 ? `\n**Зависимости:**\n${data.dependencies.map((d: string) => `- ${d}`).join("\n")}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  await createAICComment(taskId, analysisMessage, aiUserId);

  if (data.needsClarification && data.clarificationQuestions.length > 0) {
    const questions = data.clarificationQuestions
      .map((q: string, i: number) => `${i + 1}. ${q}`)
      .join("\n");
    await createAICComment(
      taskId,
      `❓ **Уточняющие вопросы (цикл 1 из 3):**\n\n${questions}\n\nПожалуйста, ответьте на эти вопросы в комментарии ниже.`,
      aiUserId,
    );
  }

  revalidatePath(`/tasks/${taskId}`);
  revalidatePath("/dashboard");

  return { success: true, status: "ANALYZING", message: "Analysis complete" };
}

export async function processUserAnswer(
  taskId: string,
  answer: string,
): Promise<{
  success: boolean;
  status: string;
  message: string;
}> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, status: "error", message: "Unauthorized" };

  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task) return { success: false, status: "error", message: "Task not found" };

  if (task.status !== "ANALYZING") {
    return { success: false, status: "error", message: "Task is not in analyzing state" };
  }

  const comments = await getComments(taskId);
  const aiComments = comments.filter(
    (c) => c.isAI && c.content.includes("Уточняющие вопросы (цикл"),
  );

  const currentCycle = aiComments.length;

  if (currentCycle >= 3) {
    return { success: false, status: "ANALYZING", message: "Maximum clarification cycles reached" };
  }

  const aiUserId = await getOrCreateAIManagerUser();

  const qaHistory: { question: string; answer: string }[] = [];
  for (let i = 0; i < comments.length - 1; i++) {
    if (comments[i].isAI && comments[i].content.includes("Уточняющие вопросы")) {
      const nextUserComment = comments
        .slice(i + 1)
        .find((c) => !c.isAI);
      if (nextUserComment) {
        const questions = comments[i].content
          .split("\n")
          .filter((l: string) => /^\d+\./.test(l))
          .map((l: string) => l.replace(/^\d+\.\s*/, "").trim());
        qaHistory.push({
          question: questions.join("; "),
          answer: nextUserComment.content,
        });
      }
    }
  }
  qaHistory.push({ question: "Последний ответ пользователя", answer });

  const title = sanitizeInput(task.title);
  const description = sanitizeInput(task.description || "");

  const newQuestions = await generateClarifyingQuestions(
    title,
    description,
    qaHistory,
    currentCycle + 1,
  );

  if (newQuestions.length > 0 && currentCycle < 2) {
    const questions = newQuestions
      .map((q: string, i: number) => `${i + 1}. ${q}`)
      .join("\n");
    await createAICComment(
      taskId,
      `✅ Спасибо за ответ!\n\n❓ **Уточняющие вопросы (цикл ${currentCycle + 2} из 3):**\n\n${questions}`,
      aiUserId,
    );
  } else {
    await createAICComment(
      taskId,
      "✅ Спасибо за ответы! Контекста достаточно. Перехожу к генерации плана...",
      aiUserId,
    );
    await createPlanForTask(taskId, qaHistory);
  }

  revalidatePath(`/tasks/${taskId}`);
  revalidatePath("/dashboard");

  return { success: true, status: "ANALYZING", message: "Answer processed" };
}

async function createPlanForTask(
  taskId: string,
  qaHistory: { question: string; answer: string }[],
): Promise<void> {
  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task) return;

  const title = sanitizeInput(task.title);
  const description = sanitizeInput(task.description || "");

  const result = await generatePlan(title, description, qaHistory);

  if (!result.success || !result.data) {
    const aiUserId = await getOrCreateAIManagerUser();
    await createAICComment(
      taskId,
      "⚠️ Не удалось сгенерировать план. Пожалуйста, попробуйте позже или создайте план вручную.",
      aiUserId,
    );
    return;
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
    where: { id: taskId },
    data: {
      plan: JSON.stringify(plan),
      status: "PENDING_APPROVAL",
    },
  });

  await prisma.taskLog.create({
    data: {
      taskId,
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
        taskId,
        sortOrder: i,
      },
    });
  }

  const aiUserId = await getOrCreateAIManagerUser();

  const subtaskList = plan.subtasks
    .map(
      (st, i) =>
        `${i + 1}. **${st.title}** — ${st.estimatedHours}ч, исполнитель: ${st.assigneeRole}`,
    )
    .join("\n");

  await createAICComment(
    taskId,
    [
      `📋 **План выполнения сгенерирован**\n\n${plan.summary}\n\n**Подзадачи:**\n${subtaskList}`,
      `\nЗадача переведена в статус «На утверждении».`,
    ].join("\n"),
    aiUserId,
  );
}

export async function approvePlan(taskId: string): Promise<{
  success: boolean;
  message: string;
}> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, message: "Unauthorized" };

  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task) return { success: false, message: "Task not found" };

  if (task.status !== "PENDING_APPROVAL") {
    return { success: false, message: "Task is not pending approval" };
  }

  await prisma.task.update({
    where: { id: taskId },
    data: { status: "IN_PROGRESS" },
  });

  await prisma.taskLog.create({
    data: {
      taskId,
      fromStatus: "PENDING_APPROVAL",
      toStatus: "IN_PROGRESS",
      userId: session.user.id,
    },
  });

  await prisma.subtask.updateMany({
    where: { taskId, status: "TODO" },
    data: { status: "IN_PROGRESS" },
  });

  revalidatePath(`/tasks/${taskId}`);
  revalidatePath("/dashboard");

  return { success: true, message: "Plan approved, task is now in progress" };
}

export async function rejectPlan(
  taskId: string,
  reason: string,
): Promise<{
  success: boolean;
  message: string;
}> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, message: "Unauthorized" };

  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task) return { success: false, message: "Task not found" };

  if (task.status !== "PENDING_APPROVAL") {
    return { success: false, message: "Task is not pending approval" };
  }

  await prisma.task.update({
    where: { id: taskId },
    data: { status: "ANALYZING" },
  });

  await prisma.taskLog.create({
    data: {
      taskId,
      fromStatus: "PENDING_APPROVAL",
      toStatus: "ANALYZING",
      userId: session.user.id,
    },
  });

  const aiUserId = await getOrCreateAIManagerUser();
  await createAICComment(
    taskId,
    `❌ План отклонён пользователем.\nПричина: ${reason}\n\nВы можете повторно запустить анализ или отредактировать план вручную.`,
    aiUserId,
  );

  revalidatePath(`/tasks/${taskId}`);
  revalidatePath("/dashboard");

  return { success: true, message: "Plan rejected, task returned to analyzing" };
}

export async function getTaskWithDetails(taskId: string) {
  const session = await auth();
  if (!session?.user?.id) return null;

  const membership = await prisma.tenantMember.findFirst({
    where: { userId: session.user.id },
  });
  if (!membership) return null;

  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: {
      assignee: { select: { name: true, image: true } },
      project: { select: { name: true } },
      subtasks: {
        orderBy: { sortOrder: "asc" },
        include: {
          assignee: { select: { name: true, role: true } },
        },
      },
      logs: {
        orderBy: { createdAt: "desc" },
        take: 20,
      },
    },
  });

  return task;
}

const VALID_TRANSITIONS: Record<string, string[]> = {
  BACKLOG: ["ANALYZING"],
  ANALYZING: ["PENDING_APPROVAL", "BACKLOG"],
  PENDING_APPROVAL: ["IN_PROGRESS", "ANALYZING"],
  IN_PROGRESS: ["REVIEW", "ANALYZING"],
  REVIEW: ["CLOSED", "ANALYZING", "IN_PROGRESS"],
  CLOSED: [],
};

function isValidTransition(from: string, to: string): boolean {
  const allowed = VALID_TRANSITIONS[from];
  return allowed ? allowed.includes(to) : false;
}

export async function updateTaskStatusWithValidation(
  taskId: string,
  newStatus: string,
): Promise<{ success: boolean; message: string }> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, message: "Unauthorized" };

  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task) return { success: false, message: "Task not found" };

  if (!isValidTransition(task.status, newStatus)) {
    return {
      success: false,
      message: `Invalid transition from ${task.status} to ${newStatus}`,
    };
  }

  await prisma.task.update({
    where: { id: taskId },
    data: { status: newStatus },
  });

  await prisma.taskLog.create({
    data: {
      taskId,
      fromStatus: task.status,
      toStatus: newStatus,
      userId: session.user.id,
    },
  });

  revalidatePath(`/tasks/${taskId}`);
  revalidatePath("/dashboard");

  return { success: true, message: `Status changed to ${newStatus}` };
}

export async function acceptTask(
  taskId: string,
): Promise<{ success: boolean; message: string }> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, message: "Unauthorized" };

  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task) return { success: false, message: "Task not found" };

  if (task.status !== "REVIEW") {
    return { success: false, message: "Task is not in review" };
  }

  await prisma.task.update({
    where: { id: taskId },
    data: { status: "CLOSED" },
  });

  await prisma.taskLog.create({
    data: {
      taskId,
      fromStatus: "REVIEW",
      toStatus: "CLOSED",
      userId: session.user.id,
    },
  });

  revalidatePath(`/tasks/${taskId}`);
  revalidatePath("/dashboard");

  return { success: true, message: "Task accepted and closed" };
}

export async function rejectFromReview(
  taskId: string,
  reason: string,
): Promise<{ success: boolean; message: string }> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, message: "Unauthorized" };

  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task) return { success: false, message: "Task not found" };

  if (task.status !== "REVIEW") {
    return { success: false, message: "Task is not in review" };
  }

  await prisma.task.update({
    where: { id: taskId },
    data: { status: "ANALYZING" },
  });

  await prisma.taskLog.create({
    data: {
      taskId,
      fromStatus: "REVIEW",
      toStatus: "ANALYZING",
      userId: session.user.id,
    },
  });

  const aiUserId = await getOrCreateAIManagerUser();
  await createAICComment(
    taskId,
    `❌ Задача отклонена на приёмке.\nПричина: ${reason}\n\nЗадача возвращена на анализ.`,
    aiUserId,
  );

  revalidatePath(`/tasks/${taskId}`);
  revalidatePath("/dashboard");

  return { success: true, message: "Task rejected, returned to analyzing" };
}

export async function updateSubtaskStatus(
  subtaskId: string,
  newStatus: string,
): Promise<{ success: boolean; message: string }> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, message: "Unauthorized" };

  const subtask = await prisma.subtask.findUnique({
    where: { id: subtaskId },
    include: { task: true },
  });
  if (!subtask) return { success: false, message: "Subtask not found" };

  if (!["TODO", "IN_PROGRESS", "DONE"].includes(newStatus)) {
    return { success: false, message: "Invalid subtask status" };
  }

  await prisma.subtask.update({
    where: { id: subtaskId },
    data: { status: newStatus },
  });

  const allSubtasks = await prisma.subtask.findMany({
    where: { taskId: subtask.taskId },
  });

  const allDone = allSubtasks.length > 0 && allSubtasks.every((s) => {
    if (s.id === subtaskId) return newStatus === "DONE";
    return s.status === "DONE";
  });

  if (allDone && subtask.task.status === "IN_PROGRESS") {
    await prisma.task.update({
      where: { id: subtask.taskId },
      data: { status: "REVIEW" },
    });

    await prisma.taskLog.create({
      data: {
        taskId: subtask.taskId,
        fromStatus: "IN_PROGRESS",
        toStatus: "REVIEW",
        userId: session.user.id,
      },
    });
  }

  revalidatePath(`/tasks/${subtask.taskId}`);
  revalidatePath("/dashboard");

  return { success: true, message: `Subtask status updated to ${newStatus}` };
}

export async function assignTask(
  taskId: string,
  assigneeId: string,
): Promise<{ success: boolean; message: string }> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, message: "Unauthorized" };

  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task) return { success: false, message: "Task not found" };

  if (task.status === "CLOSED") {
    return { success: false, message: "Cannot reassign closed task" };
  }

  await prisma.task.update({
    where: { id: taskId },
    data: { assigneeId },
  });

  revalidatePath(`/tasks/${taskId}`);
  revalidatePath("/dashboard");

  return { success: true, message: "Assignee updated" };
}

export async function getAssignableMembers() {
  const session = await auth();
  if (!session?.user?.id) return [];

  const membership = await prisma.tenantMember.findFirst({
    where: { userId: session.user.id },
  });
  if (!membership) return [];

  const users = await prisma.user.findMany({
    where: {
      memberships: { some: { tenantId: membership.tenantId } },
    },
    select: { id: true, name: true, email: true },
  });

  const aiCoworkers = await prisma.aICoworker.findMany({
    where: { tenantId: membership.tenantId },
    select: { id: true, name: true, role: true },
  });

  return [
    ...users.map((u) => ({
      id: u.id,
      name: u.name || u.email,
      type: "human" as const,
    })),
    ...aiCoworkers.map((cw) => ({
      id: cw.id,
      name: `${cw.name} (${cw.role})`,
      type: "ai" as const,
    })),
  ];
}

export async function updateTaskPlan(
  taskId: string,
  planJson: string,
): Promise<{ success: boolean; message: string }> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, message: "Unauthorized" };

  await prisma.task.update({
    where: { id: taskId },
    data: { plan: planJson },
  });

  revalidatePath(`/tasks/${taskId}`);
  return { success: true, message: "Plan updated" };
}
