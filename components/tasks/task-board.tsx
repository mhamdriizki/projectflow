'use client'

import { updateTaskStatus } from "@/actions/task";
import Link from "next/link";
import { useOptimistic, useTransition } from "react";
import { Badge } from "../ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";
type PriorityStatus = 'LOW' | 'MEDIUM' | 'HIGH';

type Task = {
  id: string;
  title: string;
  status: TaskStatus;
  priority: PriorityStatus;
  assignee: {name: string} | null;
}

const COLUMNS: { status: TaskStatus, label: string}[] = [
  { status: "TODO", label: "To Do"},
  { status: "IN_PROGRESS", label: "In Progress" },
  { status: "DONE", label: "Done" }
]

const PRIORITY_VARIANT = {
  LOW: "secondary",
  MEDIUM: "default",
  HIGH: "destructive"
} as const;

export function TaskBoard({ tasks }: { tasks: Task[]}) {
  const [, startTransition] = useTransition();
  const [optimisticTasks, setOptimisticTasks] = useOptimistic(
    tasks,
    (state, { taskId, status }: { taskId: string; status: TaskStatus }) =>
      state.map((t) => (t.id === taskId ? {...t, status} : t))
  )

  function handleStatusChange(taskId: string, status: TaskStatus) {
    startTransition(async () => {
      setOptimisticTasks({ taskId, status })
      await updateTaskStatus(taskId, status);
    })
  }

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {COLUMNS.map((col) => {
        const columnTasks = optimisticTasks.filter((t) => t.status === col.status);
        return (
          <div key={col.status} className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground">{col.label} ({columnTasks.length})</h3>

            <div className="space-y-2">
              {columnTasks.map((task) => {
                <div key={task.id} className="space-y-2 rounded-lg border-p-3">
                  <Link href={`tasks/${task.id}`} className="text-sm font-medium hover:underline">
                    {task.title}
                  </Link>
                  
                  <div className="flex items-center justify-between gap-2">
                    <Badge variant={PRIORITY_VARIANT[task.priority]}>{task.priority}</Badge>

                    {task.assignee && (
                      <span className="text-xs text-muted-foreground">{task.assignee.name}</span>
                    )}
                  </div>

                  <Select
                    value={task.status}
                    onValueChange={(value) => handleStatusChange(task.id, value as TaskStatus)}>
                      <SelectTrigger size="sm" className="w-full">
                        <SelectValue>
                          {(value: TaskStatus) => COLUMNS.find((c) => c.status === value)?.label}
                        </SelectValue>
                      </SelectTrigger>

                      <SelectContent>
                        {COLUMNS.map((c) => (
                          <SelectItem key={c.status} value={c.status}>
                            {c.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                  </Select>
                </div>
              })}
              {columnTasks.length === 0 && (
                <p className="text-xs text-muted-foreground">No Tasks</p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )

}