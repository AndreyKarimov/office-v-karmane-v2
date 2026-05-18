"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export type TaskData = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  projectId: string;
  assigneeId: string | null;
  assignee: { name: string | null; image: string | null } | null;
  project: { name: string } | null;
  plan: string | null;
  createdAt: Date;
};

export async function getTasks(): Promise<TaskData[]> {
  const session = await auth();
  if (!session?.user?.id) return [];

  const membership = await prisma.tenantMember.findFirst({
    where: { userId: session.user.id },
  });

  if (!membership) return [];

  const tasks = await prisma.task.findMany({
    where: {
      project: { tenantId: membership.tenantId },
    },
    include: {
      assignee: { select: { name: true, image: true } },
      project: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return tasks;
}

type CreateTaskInput = {
  title: string;
  description?: string;
  priority?: string;
  projectId: string;
};

export async function createTask(input: CreateTaskInput) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const task = await prisma.task.create({
    data: {
      title: input.title,
      description: input.description || "",
      priority: input.priority || "MEDIUM",
      status: "BACKLOG",
      projectId: input.projectId,
      assigneeId: session.user.id,
    },
  });

  revalidatePath("/dashboard");
  return task;
}

export async function getTaskById(taskId: string) {
  const session = await auth();
  if (!session?.user?.id) return null;

  const membership = await prisma.tenantMember.findFirst({
    where: { userId: session.user.id },
  });
  if (!membership) return null;

  return prisma.task.findUnique({
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
}

export async function updateTaskStatus(taskId: string, newStatus: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task) throw new Error("Task not found");

  const updated = await prisma.task.update({
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

  revalidatePath("/dashboard");
  return updated;
}

export async function deleteTask(taskId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await prisma.task.delete({ where: { id: taskId } });

  revalidatePath("/dashboard");
}

export async function getProjects() {
  const session = await auth();
  if (!session?.user?.id) return [];

  const membership = await prisma.tenantMember.findFirst({
    where: { userId: session.user.id },
  });

  if (!membership) return [];

  return prisma.project.findMany({
    where: { tenantId: membership.tenantId },
    include: { _count: { select: { tasks: true } } },
    orderBy: { createdAt: "asc" },
  });
}

export async function createProject(name: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const membership = await prisma.tenantMember.findFirst({
    where: { userId: session.user.id },
  });
  if (!membership) throw new Error("No tenant");

  const project = await prisma.project.create({
    data: {
      name: name.trim(),
      tenantId: membership.tenantId,
    },
  });

  revalidatePath("/dashboard");
  return project;
}
