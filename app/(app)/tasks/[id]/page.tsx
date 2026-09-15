import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { deleteTask } from "@/actions/task";
import { AssigneeSelect } from "@/components/tasks/assignee-select";
import { CommentForm } from "@/components/tasks/comment-form";
import { CommentList } from "@/components/tasks/comment-list";
import { AttachmentUpload } from "@/components/uploads/attachment-upload";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// Satu query nyari task, langsung include semua relasi yang dibutuhin
// halaman ini (project + members buat assignee picker, assignee,
// comments+author, attachments) — bukan beberapa query terpisah.
// Membership check-nya ikut di WHERE (task itu harus punya project yang
// si user jadi member-nya), jadi task yang gak ketemu ATAU task yang
// project-nya bukan milik user balikin `null` yang sama — notFound() 404
// buat non-member, alasan sama kayak project detail.
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
            ← {task.project.name}
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
          <Badge variant="outline">Due {new Date(task.dueDate).toLocaleDateString()}</Badge>
        )}
      </div>

      {task.description && <p className="text-muted-foreground">{task.description}</p>}

      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Assignee:</span>
        <AssigneeSelect
          taskId={task.id}
          assigneeId={task.assigneeId}
          members={task.project.members.map((m) => ({ userId: m.userId, name: m.user.name }))}
        />
      </div>

      <section className="space-y-2">
        <h2 className="font-medium">
          Attachments{task.attachments.length > 0 && ` (${task.attachments.length})`}
        </h2>
        {task.attachments.length > 0 && (
          <ul className="space-y-1">
            {task.attachments.map((a) => (
              <li key={a.id}>
                <a
                  href={a.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline"
                >
                  {a.filename}
                </a>
              </li>
            ))}
          </ul>
        )}
        <AttachmentUpload taskId={task.id} />
      </section>

      <section className="space-y-4">
        <h2 className="font-medium">Comments ({task.comments.length})</h2>
        <CommentList comments={task.comments} currentUserId={session.user.id} />
        <CommentForm taskId={task.id} />
      </section>
    </main>
  );
}
