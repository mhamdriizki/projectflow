"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { requireProjectMember } from "@/lib/permissions";
import { checkRateLimit } from "@/lib/ratelimit";
import {
  CreateProjectSchema,
  UpdateProjectSchema,
  AddMemberSchema,
  type ProjectActionState,
} from "@/types/project";

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

  // 4. Execute — Project + Membership dibuat atomic dalam satu create
  // (nested write Prisma jalan dalam satu transaction implisit; kalau
  // insert Membership gagal, insert Project ikut di-rollback)
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
  // 1. Auth + Ownership (member check)
  await requireProjectMember(projectId);

  // 2. Validate — partial, cuma field yang dikirim yang divalidasi/diupdate
  const parsed = UpdateProjectSchema.safeParse({
    name: formData.get("name") || undefined,
    description: formData.get("description") || undefined,
    color: formData.get("color") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  // 3. Execute
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

export async function addMember(
  projectId: string,
  _prev: ProjectActionState,
  formData: FormData
): Promise<ProjectActionState> {
  // 1. Auth + Ownership (caller harus member project ini dulu)
  await requireProjectMember(projectId);

  // 2. Parse
  const parsed = AddMemberSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  // 3. User exists?
  const invitedUser = await prisma.user.findUnique({
    where: { email: parsed.data.email },
  });
  if (!invitedUser) return { error: "No user found with that email" };

  // 4. Not self
  const session = await requireSession();
  if (invitedUser.id === session.user.id) {
    return { error: "You are already a member of this project" };
  }

  // 5. Not duplicate
  const existing = await prisma.membership.findUnique({
    where: { userId_projectId: { userId: invitedUser.id, projectId } },
  });
  if (existing) return { error: "This user is already a member" };

  // 6. Execute
  await prisma.membership.create({
    data: { userId: invitedUser.id, projectId },
  });

  revalidatePath(`/projects/${projectId}`);
  return {};
}

export async function removeMember(
  projectId: string,
  memberUserId: string
): Promise<void> {
  const session = await requireProjectMember(projectId);

  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) return;

  const isSelf = memberUserId === session.user.id;
  const isOwner = project.ownerId === session.user.id;

  // Owner project gak bisa di-remove (harus delete project atau transfer
  // ownership dulu). Selain itu, cuma diri sendiri (leave) atau owner
  // (kick) yang boleh remove.
  if (memberUserId === project.ownerId) return;
  if (!isSelf && !isOwner) return;

  await prisma.membership.delete({
    where: { userId_projectId: { userId: memberUserId, projectId } },
  });

  revalidatePath(`/projects/${projectId}`);
}
