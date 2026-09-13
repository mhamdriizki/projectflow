"use server";

import { requiredProjectMember } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/ratelimit";
import { requireSession } from "@/lib/session";
import {
  AddMemberSchema,
  CreateProjectSchema,
  UpdateProjectSchema,
  type ProjectActionState,
} from "@/types/project";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createProject(
  _prev: ProjectActionState,
  formData: FormData,
): Promise<ProjectActionState> {
  // 1. Authentication
  const session = await requireSession();

  // 2. Rate Limiter
  const { limited } = await checkRateLimit(`createProject:${session.user.id}`);
  if (limited) return { error: "Too many requests. Please wait" };

  // 3. Validasi
  const parsed = CreateProjectSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") || undefined,
    color: formData.get("color") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  // 4. Execute data
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
  formData: FormData,
): Promise<ProjectActionState> {
  await requiredProjectMember(projectId);

  const parsed = UpdateProjectSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") || undefined,
    color: formData.get("color") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  await prisma.project.update({
    where: { id: projectId },
    data: parsed.data,
  });

  revalidatePath(`/projects/${projectId}`);
  redirect(`/projects/${projectId}`);
}

export async function deleteProject(projectId: string): Promise<void> {
  const session = await requireSession();
  const project = await prisma.project.findUnique({ where: { id: projectId } });

  if (!project || project.ownerId !== session.user.id) return;

  await prisma.project.delete({ where: { id: projectId } });

  revalidatePath("/projects");
  redirect("/projects");
}

export async function removeMember(
  projectId: string,
  memberUserId: string,
): Promise<void> {
  const session = await requiredProjectMember(projectId);

  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) return;

  const isSelf = memberUserId === session.user.id;
  const isOwner = project.ownerId === session.user.id;

  if (memberUserId === project.ownerId) return;
  if (!isSelf && !isOwner) return;

  await prisma.membership.delete({
    where: { userId_projectId: { userId: memberUserId, projectId } },
  });

  revalidatePath(`/projects/${projectId}`);
}

export async function addMember(
  projectId: string,
  _prev: ProjectActionState,
  formData: FormData,
): Promise<ProjectActionState> {
  // 1. Auth + ownership
  await requiredProjectMember(projectId);

  // 2. Parsing data
  const parsed = AddMemberSchema.safeParse({
    email: formData.get("email"),
  });

  // 3. Validasai user exist?
  const invitedUser = await prisma.user.findUnique({
    where: { email: parsed.data?.email },
  });
  if (!invitedUser) return { error: "No user found with thath email" };

  // 4. Not Self
  const session = await requireSession();
  if (invitedUser.id === session.user.id) {
    return { error: "You are already a member" };
  }

  // 5. Not duplicate
  const existing = await prisma.membership.findUnique({
    where: { userId_projectId: {userId: invitedUser.id, projectId}}
  })
  if (existing) return { error: "This user is already a member" }

  // 6. Execute
  await prisma.membership.create({
    data: { userId: invitedUser.id, projectId }
  })

  revalidatePath(`/projects/${projectId}`)
  return {}
}
