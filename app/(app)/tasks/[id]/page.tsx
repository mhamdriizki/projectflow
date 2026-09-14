import { deleteTask } from "@/actions/task";
import { AssigneeSelect } from "@/components/tasks/assignee-select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

async function getTask(taskId: string, userId: string) {
  return prisma.task.findFirst({
    where: { id: taskId, project: { members: { some: { userId } } } },
    include: {
      project: { include: { members: { include: { user: true } } } },
      assignee: true,
      comments: { include: { author: true }, orderBy: { createdAt: "asc" } },
      attachments: true,
    },
  });
}

export async function generateMetadata({
  params,
}: PageProps<"/tasks/[id]">): Promise<Metadata> {
  const { id } = await params;
  const session = await requireSession();
  const task = await getTask(id, session.user.id);

  return { title: task?.title ?? "Task" };
}

export default async function TaskDetailPage({
  params,
}: PageProps<"/tasks/[id]">) {
  const { id } = await params;
  const session = await requireSession();
  const task = await getTask(id, session.user.id);
  if (!task) notFound();

  return (
    <main className="max-w-2xl space-y-6 p-8">
      <div className="flex items-start justify-between">
        <div>
          <Link
            href={`/projects/${task.projectId}`}
            className="text-sm text-muted-foreground hover:underline"
          >
            {task.project.name}
          </Link>

          <h1 className="text-2xl font-bold">{task.title}</h1>
        </div>

        <form action={deleteTask.bind(null, task.id)}>
          <Button type="submit" variant="destructive" size="sm">
            Delete
          </Button>
        </form>
      </div>

      <div className="flex flex-wrap gap-2">
        <Badge>{task.status.replace("_", " ")}</Badge>
        <Badge variant={task.priority === "HIGH" ? "destructive" : "secondary"}>
          {task.priority}
        </Badge>

        {task.dueDate && (
          <Badge variant="outline">
            Due {new Date(task.dueDate).toLocaleDateString()}
          </Badge>
        )}
      </div>

      {task.description && (
        <p className="text-muted-foreground">{task.description}</p>
      )}

      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Assignee:</span>
        <AssigneeSelect
          taskId={task.id}
          assigneeId={task.assigneeId}
          members={task.project.members.map((m) => ({
            userId: m.userId,
            name: m.user.name,
          }))}
        />
      </div>

      <section className="space-y-2">
        <h2 className="font-medium">Comments ({task.comments.length})</h2>
        <p className="text-sm text-muted-foreground">Akan dibahas di bab 7</p>
      </section>
    </main>
  );
}
