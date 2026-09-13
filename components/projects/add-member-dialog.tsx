"use client";

import { addMember } from "@/actions/project";
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
import { UserPlus } from "lucide-react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";

export function AddMemberDialog({ projectId }: { projectId: string }) {
  const [open, setOpen] = useState(false);
  const addMemberWithId = addMember.bind(null, projectId);
  const [state, action, pending] = useActionState(addMemberWithId, {});

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="outline" size="sm" className="gap-2">
            <UserPlus className="size-4" />
            Invite
          </Button>
        }
      />

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite member</DialogTitle>

          <DialogDescription>
            Invite by email. They must already have an account.
          </DialogDescription>
        </DialogHeader>

        <form action={action} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required />
          </div>

          {state.error && (
            <p className="text-sm text-destructive">{state.error}</p>
          )}

          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending ? "Inviting" : "Invite"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
