import { getCompletionOverTime, getTasksByStatus } from "@/lib/analytics";
import { TaskStatusChart } from "./task-status-chart";
import { CompletionChart } from "./completion-chart";

export async function ChartsSection({ userId }: { userId: string }) {
  const [statusData, completionData] = await Promise.all([
    getTasksByStatus(userId),
    getCompletionOverTime(userId),
  ]);

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="rounded-lg border p-4">
        <h2 className="mb-2 text-sm font-medium">Tasks by status</h2>
        <TaskStatusChart data={statusData} />
      </div>
      <div className="rounded-lg border p-4">
        <h2 className="mb-2 text-sm font-medium">Completed — last 30 days</h2>
        <CompletionChart data={completionData} />
      </div>
    </div>
  );
}
