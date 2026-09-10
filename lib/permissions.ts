import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";

export async function requireAdmin() {
  const session = await requireSession();
  if (session.user.role !== "ADMIN") redirect("/dashboard");
  return session;
}

export async function requireProjectMember(projectId: string) {
  const session = await requireSession();
  const membership = await prisma.membership.findUnique({
    where: { userId_projectId: { userId: session.user.id, projectId } },
  });
  if (!membership) redirect("/projects");
  return session;
}
