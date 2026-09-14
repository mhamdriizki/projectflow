"use client";

import { useTransition } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { updateTaskAssignee } from "@/actions/task";

type Member = { userId: string; name: string };

export function AssigneeSelect({
  taskId,
  assigneeId,
  members,
}: {
  taskId: string;
  assigneeId: string | null;
  members: Member[];
}) {
  const [, startTransition] = useTransition();
  const nameById = Object.fromEntries(members.map((m) => [m.userId, m.name]));

  return (
    <Select
      value={assigneeId ?? "Unassigned"}
      onValueChange={(value) =>
        startTransition(() =>
          updateTaskAssignee(
            taskId,
            !value || value === "unassigned" ? "" : value,
          ),
        )
      }
    >
      <SelectTrigger size="sm" className="w-48">
        <SelectValue>
          {(value: string) => nameById[value] ?? "Unassigned"}
        </SelectValue>
      </SelectTrigger>

      <SelectContent>
        <SelectItem value="unassigned">Unassigned</SelectItem>

        {members.map((m) => (
          <SelectItem key={m.userId} value={m.userId}>
            {m.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
