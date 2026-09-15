import type { Metadata } from "next";
import { Suspense } from "react";
import { requireSession } from "@/lib/session";
import { getAllTasksForUser, getOverviewStats } from "@/lib/analytics";
import { StatCard } from "@/components/dashboard/stat-card";
import { DashboardTasksTable } from "@/components/dashboard/tasks-table";
import { ChartsSection } from "@/components/dashboard/charts-section";

export const metadata: Metadata = { title: "Dashboard" };

function ChartsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="h-70 animate-pulse rounded-lg border bg-muted/40" />
      <div className="h-70 animate-pulse rounded-lg border bg-muted/40" />
    </div>
  );
}

export default async function DashboardPage() {
  const session = await requireSession();

  // Promise.all: overview stats & task list jalan PARALEL, bukan
  // sequential await — total waktu tunggu = query paling lambat, bukan
  // jumlah semua query.
  const [stats, tasks] = await Promise.all([
    getOverviewStats(session.user.id),
    getAllTasksForUser(session.user.id),
  ]);

  return (
    <main className="space-y-6 p-8">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Projects" value={stats.totalProjects} />
        <StatCard label="Total tasks" value={stats.totalTasks} />
        <StatCard label="Completed" value={stats.completedTasks} />
        <StatCard label="Overdue" value={stats.overdueTasks} />
      </div>

      <Suspense fallback={<ChartsSkeleton />}>
        <ChartsSection userId={session.user.id} />
      </Suspense>

      <div className="space-y-2">
        <h2 className="text-sm font-medium">All tasks</h2>
        <DashboardTasksTable tasks={tasks} />
      </div>
    </main>
  );
}
