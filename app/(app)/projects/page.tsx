import { CreateProjectDialog } from "@/components/projects/create-project-dialog";
import { ProjectCard } from "@/components/projects/project-card";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { Metadata } from "next";

export const metadata: Metadata = { title: "Projects" };

export default async function ProjectsPage() {
  const session = await requireSession();

  const projects = await prisma.project.findMany({
    where: { members: { some: { userId: session.user.id } } },
    include: { _count: { select: { members: true, tasks: true } } },
    orderBy: { createdAt: "desc" },
  });

  const active = projects.filter((projectz) => !projectz.archived);
  const archived = projects.filter((projectz) => projectz.archived);

  return (
    <main className="space-y-8 p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Projects</h1>
        <CreateProjectDialog />
      </div>

      {projects.length === 0 ? (
        <p className="text-muted-foreground">
          You&apos;re not part of any project yet. Create one to get started.
        </p>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {active.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>

          {archived.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-sm font-medium text-muted-foreground">
                Archived
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {archived.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </main>
  );
}
