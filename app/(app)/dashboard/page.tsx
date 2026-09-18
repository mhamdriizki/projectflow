import { StatCard } from "@/components/dashboard/stat-card";
import { getAllTasksForUser, getOverviewStats } from "@/lib/analytics";
import { requireSession } from "@/lib/session";
import { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const session = await requireSession();

  const [stats, tasks] = await Promise.all([
    getOverviewStats(session.user.id),
    getAllTasksForUser(session.user.id)
  ])

  return (
    <main className="space-y-6 p-8">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Projects" value={stats.totalProject}/>
        <StatCard label="Total Tasks" value={stats.totalTasks}/>
        <StatCard label="Completed" value={stats.completedTasks}/>
        <StatCard label="Overdue" value={stats.overdueTasks}/>
      </div>

      {/* <Suspense fallback={}>

      </Suspense> */}
    </main>
  );
}
