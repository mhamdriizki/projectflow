import { prisma } from "./prisma";

const memberScope = (userId: string) => ({
  project: { members: { some: { userId } } },
});

const STATUS_LABEL = {
  TODO: "To Do",
  IN_PROGRESS: "In Progress",
  DONE: "Done",
};

export async function getOverviewStats(userId: string) {
  const [totalProject, totalTasks, completedTasks, overdueTasks] =
    await Promise.all([
      prisma.project.count({ where: { members: { some: { userId } } } }),
      prisma.task.count({ where: memberScope(userId) }),
      prisma.task.count({ where: { ...memberScope(userId), status: "DONE" } }),
      prisma.task.count({
        where: {
          ...memberScope(userId),
          status: "DONE",
          dueDate: { lt: new Date() },
        },
      }),
    ]);

  return { totalProject, totalTasks, completedTasks, overdueTasks };
}

export async function getTasksByStatus(userId: string) {
  const groups = await prisma.task.groupBy({
    by: ["status"],
    where: memberScope(userId),
    _count: true,
  });

  return (Object.keys(STATUS_LABEL) as (keyof typeof STATUS_LABEL)[]).map(
    (status) => ({
      status: STATUS_LABEL[status],
      count: groups.find((g) => g.status === status)?._count ?? 0,
    }),
  );
}

export async function getCompletionOverTime(userId: string, days = 30) {
  const since = new Date();
  since.setDate(since.getDate() - (days - 1));
  since.setHours(0, 0, 0, 0);

  const completed = await prisma.task.findMany({
    where: {
      ...memberScope(userId),
      status: "DONE",
      updatedAt: { gte: since },
    },
    select: { updatedAt: true },
  });

  const localKey = (d: Date) => d.toLocaleDateString("en-CA");
  const counts = new Map<string, { label: string, count: number}>();
  for (let i = 0; i < days; i++) {
    const d = new Date(since);
    d.setDate(d.getDate() + i);
    counts.set(localKey(d), {
      label: d.toLocaleDateString("en-US", {month: "short", day: "numeric"}),
      count: 0
    });
  }

  for (const task of completed) {
    const entry = counts.get(localKey(task.updatedAt));
    if (entry) entry.count++;
  }

  return Array.from(counts.values()).map(({ label, count }) => ({
    date: label,
    count,
  }));
}

export async function getAllTasksForUser(userId: string) {
  return prisma.task.findMany({
    where: memberScope(userId),
    include: { project: true, assignee: true },
    orderBy: { createdAt: "desc" },
  });
}
