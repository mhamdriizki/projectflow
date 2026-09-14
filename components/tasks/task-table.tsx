"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";

type Task = {
  id: string;
  title: string;
  status: TaskStatus;
  priority: "LOW" | "MEDIUM" | "HIGH";
  dueDate: Date | null;
  assignee: { name: string } | null;
};

const STATUS_LABEL: Record<TaskStatus, string> = {
  TODO: "To Do",
  IN_PROGRESS: "In Progress",
  DONE: "Done",
};

export function TaskTable({ tasks }: { tasks: Task[] }) {
  const [statusFilter, setStatusFilter] = useState<TaskStatus | "ALL">("ALL");

  const filtered = statusFilter === "ALL" ? tasks : tasks.filter((t) => t.status === statusFilter);

  return (
    <div className="space-y-3">
      <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as TaskStatus | "ALL")}>
        <SelectTrigger size="sm" className="w-40">
          <SelectValue>
            {(value: TaskStatus | "ALL") => (value === "ALL" ? "All statuses" : STATUS_LABEL[value])}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">All statuses</SelectItem>
          <SelectItem value="TODO">To Do</SelectItem>
          <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
          <SelectItem value="DONE">Done</SelectItem>
        </SelectContent>
      </Select>

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/50 text-left text-muted-foreground">
            <tr>
              <th className="px-4 py-2 font-medium">Title</th>
              <th className="px-4 py-2 font-medium">Status</th>
              <th className="px-4 py-2 font-medium">Priority</th>
              <th className="px-4 py-2 font-medium">Assignee</th>
              <th className="px-4 py-2 font-medium">Due date</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filtered.map((task) => (
              <tr key={task.id}>
                <td className="px-4 py-2">
                  <Link href={`/tasks/${task.id}`} className="hover:underline">
                    {task.title}
                  </Link>
                </td>
                <td className="px-4 py-2">{STATUS_LABEL[task.status]}</td>
                <td className="px-4 py-2">
                  <Badge variant={task.priority === "HIGH" ? "destructive" : "secondary"}>
                    {task.priority}
                  </Badge>
                </td>
                <td className="px-4 py-2 text-muted-foreground">{task.assignee?.name ?? "—"}</td>
                <td className="px-4 py-2 text-muted-foreground">
                  {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "—"}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-muted-foreground">
                  No tasks
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
