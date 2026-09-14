"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { requireProjectMember } from "@/lib/permissions";
import { checkRateLimit } from "@/lib/ratelimit";
import {
  CreateTaskSchema,
  TaskStatusEnum,
  type TaskActionState,
} from "@/types/task";

export async function createTask(
  _prev: TaskActionState,
  formData: FormData
): Promise<TaskActionState> {
  // 1. Auth
  const session = await requireSession();

  // 2. Rate limit
  const { limited } = await checkRateLimit(`createTask:${session.user.id}`);
  if (limited) return { error: "Too many requests. Please wait." };

  // 3. Validate
  const parsed = CreateTaskSchema.safeParse({
    projectId: formData.get("projectId"),
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    status: formData.get("status") || undefined,
    priority: formData.get("priority") || undefined,
    dueDate: formData.get("dueDate") || undefined,
    assigneeId: formData.get("assigneeId") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  // 4. Ownership — caller harus member project yang dituju
  await requireProjectMember(parsed.data.projectId);

  // 5. Execute
  const { dueDate, ...rest } = parsed.data;
  const task = await prisma.task.create({
    data: { ...rest, dueDate: dueDate ? new Date(dueDate) : undefined },
  });

  revalidatePath(`/projects/${parsed.data.projectId}`);
  redirect(`/tasks/${task.id}`);
}

export async function updateTaskStatus(
  taskId: string,
  status: string
): Promise<void> {
  const parsedStatus = TaskStatusEnum.safeParse(status);
  if (!parsedStatus.success) return;

  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task) return;

  // Auth + ownership — caller harus member project pemilik task ini
  await requireProjectMember(task.projectId);

  await prisma.task.update({
    where: { id: taskId },
    data: { status: parsedStatus.data },
  });

  revalidatePath(`/projects/${task.projectId}`);
}

export async function updateTaskAssignee(
  taskId: string,
  assigneeId: string
): Promise<void> {
  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task) return;

  await requireProjectMember(task.projectId);

  // "" = unassign. Kalau ada id, wajib member project ini — gak boleh
  // assign ke orang di luar project.
  if (assigneeId) {
    const membership = await prisma.membership.findUnique({
      where: { userId_projectId: { userId: assigneeId, projectId: task.projectId } },
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

export async function deleteTask(taskId: string): Promise<void> {
  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task) return;

  await requireProjectMember(task.projectId);

  await prisma.task.delete({ where: { id: taskId } });
  revalidatePath(`/projects/${task.projectId}`);
  redirect(`/projects/${task.projectId}`);
}
