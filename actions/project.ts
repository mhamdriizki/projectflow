"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { requireProjectMember } from "@/lib/permissions";
import { checkRateLimit } from "@/lib/ratelimit";
import type { ProjectActionState } from "@/types/project";

const CreateProjectSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  color: z.string().optional(),
});

export async function createProject(
  _prev: ProjectActionState,
  formData: FormData
): Promise<ProjectActionState> {
  // 1. Auth
  const session = await requireSession();

  // 2. Rate limit
  const { limited } = await checkRateLimit(`createProject:${session.user.id}`);
  if (limited) return { error: "Too many requests. Please wait." };

  // 3. Validate
  const parsed = CreateProjectSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") || undefined,
    color: formData.get("color") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  // 4. Execute (ownership otomatis — session.user.id jadi ownerId)
  const project = await prisma.project.create({
    data: {
      ...parsed.data,
      ownerId: session.user.id,
      members: { create: { userId: session.user.id } },
    },
  });

  revalidatePath("/projects");
  redirect(`/projects/${project.id}`);
}

export async function updateProject(
  projectId: string,
  _prev: ProjectActionState,
  formData: FormData
): Promise<ProjectActionState> {
  await requireProjectMember(projectId);

  const parsed = CreateProjectSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") || undefined,
    color: formData.get("color") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  await prisma.project.update({
    where: { id: projectId },
    data: parsed.data,
  });

  revalidatePath(`/projects/${projectId}`);
  redirect(`/projects/${projectId}`);
}

export async function archiveProject(projectId: string): Promise<void> {
  await requireProjectMember(projectId);
  await prisma.project.update({
    where: { id: projectId },
    data: { archived: true },
  });
  revalidatePath("/projects");
  redirect("/projects");
}

export async function deleteProject(projectId: string): Promise<void> {
  const session = await requireSession();
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project || project.ownerId !== session.user.id) return;
  await prisma.project.delete({ where: { id: projectId } });
  revalidatePath("/projects");
  redirect("/projects");
}
