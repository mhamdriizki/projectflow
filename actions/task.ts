"use server";

import { requiredProjectMember } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { TaskStatusEnum } from "@/types/task";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function updateTaskStatus(
  taskId: string,
  status: string,
): Promise<void> {
  const parsedStatus = TaskStatusEnum.safeParse(status);
  if (!parsedStatus.success) return;

  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task) return;

  await requiredProjectMember(task.projectId);

  await prisma.task.update({
    where: { id: taskId },
    data: { status: parsedStatus.data },
  });

  revalidatePath(`projects/${task.projectId}`);
}

export async function deleteTask(taskId: string): Promise<void> {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
  });
  if (!task) return;

  await requiredProjectMember(task.projectId);

  await prisma.task.delete({
    where: { id: taskId },
  });

  revalidatePath(`/projects/${task.projectId}`);
  redirect(`/projects/${task.projectId}`);
}

export async function updateTaskAssignee(
  taskId: string,
  assigneeId: string,
): Promise<void> {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
  });
  if (!task) return;

  await requiredProjectMember(task.projectId);

  if (assigneeId) {
    const membership = await prisma.membership.findUnique({
      where: {
        userId_projectId: { userId: assigneeId, projectId: task.projectId },
      },
    });
    if (!membership) return;
  }

  await prisma.task.update({
    where: { id: taskId },
    data: { assigneeId: assigneeId || null },
  });

  revalidatePath(`/projects/${task.projectId}`);
  revalidatePath(`/tasks/${taskId}`);
}
