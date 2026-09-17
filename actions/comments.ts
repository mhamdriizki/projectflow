"use server";

import { requiredProjectMember } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/ratelimit";
import { requireSession } from "@/lib/session";
import { CreateCommentSchema, TaskActionState } from "@/types/task";
import { revalidatePath } from "next/cache";

export async function addComents(
  _prev: TaskActionState,
  formData: FormData,
): Promise<TaskActionState> {
  const session = await requireSession();

  const { limited } = await checkRateLimit(`addComments:${session.user.id}`);
  if (limited) return { error: "Too many request, please try again" };

  const parsed = CreateCommentSchema.safeParse({
    body: formData.get("body"),
    taskId: formData.get("taskId"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const task = await prisma.task.findUnique({
    where: { id: parsed.data.taskId },
  });
  if (!task) return { error: "Task not found" };

  await requiredProjectMember(task.projectId);

  await prisma.comment.create({
    data: {
      body: parsed.data.body,
      taskId: parsed.data.taskId,
      authorId: session.user.id,
    },
  });

  revalidatePath(`/tasks/${parsed.data.taskId}`);
  return {};
}

export async function deleteComment(commentId: string): Promise<void> {
  const session = await requireSession();

  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
  });
  if (!comment) return;

  if (comment.authorId !== session.user.id) return;

  await prisma.comment.delete({
    where: { id: commentId },
  });

  revalidatePath(`/tasks/${comment.taskId}`);
}
