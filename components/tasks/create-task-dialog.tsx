"use client";

import { useActionState, useState } from "react";
import { createTask } from "@/actions/task";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";

type Member = { userId: string; name: string };

export function CreateTaskDialog({
  projectId,
  members,
}: {
  projectId: string;
  members: Member[];
}) {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState(createTask, {});

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button size="sm" className="gap-2">
            <Plus className="size-4" />
            New Task
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create task</DialogTitle>
          <DialogDescription>Add a task to this project.</DialogDescription>
        </DialogHeader>
        <form action={action} className="space-y-4">
          <input type="hidden" name="projectId" value={projectId} />
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" name="title" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" rows={3} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <select
                name="status"
                id="status"
                defaultValue="TODO"
                className="flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
              >
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="DONE">Done</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <select
                name="priority"
                id="priority"
                defaultValue="MEDIUM"
                className="flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dueDate">Due date</Label>
              <Input id="dueDate" name="dueDate" type="date" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="assignee">Assignee</Label>
              <select
                name="assigneeId"
                id="assigneeId"
                defaultValue=""
                className="flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
              >
                <option value="">Unassigned</option>
                {members.map((m) => (
                  <option value={m.userId} key={m.userId}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {state.error && <p className="text-sm text-destructive">{state.error}</p>}
          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending ? "Creating…" : "Create task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
