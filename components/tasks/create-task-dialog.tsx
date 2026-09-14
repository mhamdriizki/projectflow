"use client";

import { createTask } from "@/actions/task";
import { useActionState, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Plus } from "lucide-react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";

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
          <Button className="gap-2">
            <Plus className="size-4" />
          </Button>
        }
      />

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Task</DialogTitle>
          <DialogDescription>Add a task to this project</DialogDescription>
        </DialogHeader>

        <form action={action} className="space-y-4">
          <input type="hidden" name="projectId" value={projectId} />

          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" name="title" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input id="description" name="description" />
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

          {state.error && (
            <p className="text-sm text-destructive">{state.error}</p>
          )}

          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending ? "Creating..." : "Create a task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
