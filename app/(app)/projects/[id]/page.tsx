import type { Metadata } from "next";
import { cache } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { removeMember } from "@/actions/project";
import { AddMemberDialog } from "@/components/projects/add-member-dialog";
import { CreateTaskDialog } from "@/components/tasks/create-task-dialog";
import { TaskBoard } from "@/components/tasks/task-board";
import { TaskTable } from "@/components/tasks/task-table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Settings, X } from "lucide-react";

// Membership filter ikut dalem query-nya sendiri (bukan cek terpisah
// pake requireProjectMember(), yang redirect ke /projects — itu cocok buat
// Server Action, tapi bukan buat halaman ini). Kalau project gak ada ATAU
// user login tapi bukan member, dua-duanya balikin `null` yang SAMA,
// terus di-handle jadi notFound() (404) — biar attacker gak bisa bedain
// "project gak ada" vs "project ada tapi lo gak boleh liat" dari respons.
const getProject = cache(async (projectId: string, userId: string) => {
  return prisma.project.findFirst({
    where: { id: projectId, members: { some: { userId } } },
    include: {
      members: { include: { user: true }, orderBy: { createdAt: "asc" } },
      tasks: { include: { assignee: true }, orderBy: { createdAt: "asc" } },
      _count: { select: { tasks: true } },
    },
  });
});

export async function generateMetadata({
  params,
}: PageProps<"/projects/[id]">): Promise<Metadata> {
  const { id } = await params;
  const session = await requireSession();
  const project = await getProject(id, session.user.id);
  return { title: project?.name ?? "Project" };
}

export default async function ProjectDetailPage({
  params,
}: PageProps<"/projects/[id]">) {
  const { id } = await params;
  const session = await requireSession();

  const project = await getProject(id, session.user.id);
  if (!project) notFound();

  const isOwner = project.ownerId === session.user.id;

  return (
    <main className="space-y-8 p-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className="size-3 rounded-full"
            style={{ backgroundColor: project.color ?? "#94a3b8" }}
          />
          <h1 className="text-2xl font-bold">{project.name}</h1>
        </div>
        <Link href={`/projects/${project.id}/settings`}>
          <Button variant="outline" size="sm" className="gap-2">
            <Settings className="size-4" />
            Settings
          </Button>
        </Link>
      </div>

      {project.description && (
        <p className="text-muted-foreground">{project.description}</p>
      )}

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-medium">Members ({project.members.length})</h2>
          <AddMemberDialog projectId={project.id} />
        </div>
        <ul className="divide-y rounded-lg border">
          {project.members.map((membership) => {
            const isMemberOwner = membership.userId === project.ownerId;
            const canRemove =
              !isMemberOwner &&
              (membership.userId === session.user.id || isOwner);
            return (
              <li
                key={membership.id}
                className="flex items-center justify-between px-4 py-2"
              >
                <div>
                  <p className="text-sm font-medium">{membership.user.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {membership.user.email}
                    {isMemberOwner && " · Owner"}
                  </p>
                </div>
                {canRemove && (
                  <form action={removeMember.bind(null, project.id, membership.userId)}>
                    <Button type="submit" variant="ghost" size="icon" aria-label="Remove member">
                      <X className="size-4" />
                    </Button>
                  </form>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-medium">Tasks ({project.tasks.length})</h2>
          <CreateTaskDialog
            projectId={project.id}
            members={project.members.map((m) => ({ userId: m.userId, name: m.user.name }))}
          />
        </div>
        <Tabs defaultValue="board">
          <TabsList>
            <TabsTrigger value="board">Board</TabsTrigger>
            <TabsTrigger value="table">Table</TabsTrigger>
          </TabsList>
          <TabsContent value="board">
            <TaskBoard tasks={project.tasks} />
          </TabsContent>
          <TabsContent value="table">
            <TaskTable tasks={project.tasks} />
          </TabsContent>
        </Tabs>
      </section>
    </main>
  );
}
