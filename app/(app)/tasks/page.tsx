import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = { title: "Tasks" };

export default async function TasksPage() {
  const session = await requireSession();

  const tasks = await prisma.task.findMany({
    where: { assigneeId: session.user.id },
    include: { project: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="space-y-6 p-8">
      <h1 className="text-2xl font-bold">My Tasks</h1>
      {tasks.length === 0 ? (
        <p className="text-muted-foreground">No tasks assigned to you yet.</p>
      ) : (
        <ul className="divide-y rounded-lg border">
          {tasks.map((task) => (
            <li key={task.id} className="flex items-center justify-between px-4 py-3">
              <div>
                <Link href={`/tasks/${task.id}`} className="text-sm font-medium hover:underline">
                  {task.title}
                </Link>
                <p className="text-xs text-muted-foreground">{task.project.name}</p>
              </div>
              <Badge>{task.status.replace("_", " ")}</Badge>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
