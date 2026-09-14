import { archiveProject, deleteProject } from "@/actions/project";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { Metadata } from "next";
import { notFound } from "next/navigation";

export const metadata: Metadata = { title: "Project Settings" };

export default async function ProjectSettingsPage({
  params,
}: PageProps<"/projects/[id]/settings">) {
  const { id } = await params;
  const session = await requireSession();

  const project = await prisma.project.findFirst({
    where: { id, members: { some: { userId: session.user.id } } },
  });
  if (!project) notFound();

  const isOwner = project.ownerId === session.user.id;

  return (
    <main className="max-w-lg space-y-8 p-8">
      <h1 className="text-2xl font-bold">Settings {project.name}</h1>

      <section className="space-y-2">
        <h2 className="font-medium">Archive project</h2>
        <p className="text-sm text-muted-foreground">
          Archived projects are hidden from the active list, but not deleted
        </p>

        <form action={archiveProject.bind(null, project.id)}>
          <Button type="submit" variant="outline" disabled={project.archived}>
            {project.archived ? "Already archived" : "Archive project"}
          </Button>
        </form>
      </section>

      {isOwner && (
        <section className="space-y-2 rounded-lg border border-destructive/30 p-4">
          <h2 className="font-medium text-destructive">Danger zone</h2>
          <p className="text-sm text-muted-foreground">
            Deleteing a project removes it and all its tasks permanently. Only
            the owner who can do this.
          </p>

          <form action={deleteProject.bind(null, project.id)}>
            <Button type="submit" variant="destructive">
              Delete project
            </Button>
          </form>
        </section>
      )}
    </main>
  );
}
