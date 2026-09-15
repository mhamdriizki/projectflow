"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { requireProjectMember } from "@/lib/permissions";
import { checkRateLimit } from "@/lib/ratelimit";
import { CreateCommentSchema, type TaskActionState } from "@/types/task";

export async function addComment(
  _prev: TaskActionState,
  formData: FormData
): Promise<TaskActionState> {
  const session = await requireSession();

  const { limited } = await checkRateLimit(`addComment:${session.user.id}`);
  if (limited) return { error: "Too many requests, please wait." };

  const parsed = CreateCommentSchema.safeParse({
    body: formData.get("body"),
    taskId: formData.get("taskId"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const task = await prisma.task.findUnique({ where: { id: parsed.data.taskId } });
  if (!task) return { error: "Task not found" };

  await requireProjectMember(task.projectId);

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

  const comment = await prisma.comment.findUnique({ where: { id: commentId } });
  if (!comment) return;

  // Author-only: bukan author-nya → silent no-op, JANGAN return { error }.
  // Ngasih tau caller "kamu bukan author" itu ngebocorin informasi ke
  // orang yang gak berhak — cukup gak terjadi apa-apa dari sisi mereka.
  if (comment.authorId !== session.user.id) return;

  await prisma.comment.delete({ where: { id: commentId } });
  revalidatePath(`/tasks/${comment.taskId}`);
}
