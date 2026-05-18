"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export type CommentData = {
  id: string;
  content: string;
  taskId: string;
  userId: string;
  createdAt: Date;
  user: {
    name: string | null;
    image: string | null;
  };
  attachments: {
    id: string;
    filename: string;
    url: string;
  }[];
  isAI: boolean;
};

export async function getComments(taskId: string): Promise<CommentData[]> {
  const session = await auth();
  if (!session?.user?.id) return [];

  const membership = await prisma.tenantMember.findFirst({
    where: { userId: session.user.id },
  });
  if (!membership) return [];

  const comments = await prisma.comment.findMany({
    where: { taskId },
    include: {
      user: { select: { name: true, image: true } },
      attachments: { select: { id: true, filename: true, url: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  return comments.map((c) => ({
    ...c,
    isAI: c.user.name === "ИИ-Менеджер",
  }));
}

export async function createComment(
  taskId: string,
  content: string,
): Promise<CommentData> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  if (!content.trim()) throw new Error("Comment content is required");

  const comment = await prisma.comment.create({
    data: {
      content: content.trim(),
      taskId,
      userId: session.user.id,
    },
    include: {
      user: { select: { name: true, image: true } },
      attachments: { select: { id: true, filename: true, url: true } },
    },
  });

  revalidatePath(`/tasks/${taskId}`);
  revalidatePath("/dashboard");

  return { ...comment, isAI: false };
}

export async function createAICComment(
  taskId: string,
  content: string,
  aiUserId: string,
): Promise<void> {
  await prisma.comment.create({
    data: {
      content,
      taskId,
      userId: aiUserId,
    },
  });

  revalidatePath(`/tasks/${taskId}`);
}

export async function getOrCreateAIManagerUser(): Promise<string> {
  let aiUser = await prisma.user.findFirst({
    where: { email: "ai-manager@pocket-office.internal" },
  });

  if (!aiUser) {
    aiUser = await prisma.user.create({
      data: {
        email: "ai-manager@pocket-office.internal",
        name: "ИИ-Менеджер",
      },
    });
  }

  return aiUser.id;
}
