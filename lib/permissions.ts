import { redirect } from "next/navigation";
import { requireSession } from "./session";
import { prisma } from "./prisma";

export async function requireAdmin() {
  const session = await requireSession();
  if (session.user.role !== "ADMIN") redirect("/dashboard");
  return session;
}

export async function requiredProjectMember(projectId: string) {
  const session = await requireSession();
  const membership = await prisma.membership.findUnique({
    where: { userId_projectId: { userId: session.user.id, projectId } },
  });
  if (!membership) redirect("/projects");
  return session;
}
