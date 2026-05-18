"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type OnboardingData = {
  role: string;
  tasksPerWeek: string;
  concern: string;
};

type OnboardingResult = {
  success: boolean;
  error?: string;
};

export async function completeOnboarding(
  _prev: OnboardingResult,
  formData: FormData,
): Promise<OnboardingResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Необходимо войти в систему" };
  }

  const data: OnboardingData = {
    role: (formData.get("role") as string) || "",
    tasksPerWeek: (formData.get("tasksPerWeek") as string) || "",
    concern: (formData.get("concern") as string) || "",
  };

  try {
    const membership = await prisma.tenantMember.findFirst({
      where: { userId: session.user.id },
      include: { tenant: true },
    });

    if (!membership) {
      return { success: false, error: "Тенант не найден" };
    }

    const project = await prisma.project.create({
      data: {
        name: "Демо-проект",
        description: `Создан автоматически на основе онбординга. Роль: ${data.role}. Задач в неделю: ${data.tasksPerWeek}.`,
        tenantId: membership.tenantId,
      },
    });

    await prisma.task.create({
      data: {
        title: "Добро пожаловать в Офис в кармане!",
        description: `Привет! Мы подготовили демо-проект под твою роль — ${data.role}.\n\nТы указал, что обрабатываешь ${data.tasksPerWeek.toLowerCase()} задач в неделю, и тебя больше всего беспокоит: ${data.concern.toLowerCase()}.\n\nПопробуй создать свою первую задачу — нажми на кнопку «Новая задача» в колонке «Бэклог».`,
        status: "BACKLOG",
        priority: "HIGH",
        projectId: project.id,
        assigneeId: session.user.id,
      },
    });

    return { success: true };
  } catch {
    return { success: false, error: "Произошла ошибка при создании демо-проекта" };
  }
}
