"use server";

import { requiredProjectMember } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/ratelimit";
import { requireSession } from "@/lib/session";
import {
  CreateTaskSchema,
  TaskActionState,
  TaskStatusEnum,
} from "@/types/task";
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

export async function createTask(
  _prev: TaskActionState,
  formData: FormData,
): Promise<TaskActionState> {
  const session = await requireSession();

  const { limited } = await checkRateLimit(`create task:${session.user.id}`);
  if (limited) return { error: "Too many requests, please wait." };

  const parsed = CreateTaskSchema.safeParse({
    projectId: formData.get("projectId"),
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    status: formData.get("status") || undefined,
    priority: formData.get("priority") || undefined,
    dueDate: formData.get("dueDate") || undefined,
    assigneeId: formData.get("assigneeId") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  await requiredProjectMember(parsed.data.projectId);

  const { dueDate, ...rest } = parsed.data;
  const task = await prisma.task.create({
    data: {
      ...rest,
      dueDate: dueDate ? new Date(dueDate) : undefined,
    },
  });

  revalidatePath(`/projects/${parsed.data.projectId}`);
  redirect(`/tasks/${task.id}`);
}
