"use client";

import { useActionState } from "react";
import { addComment } from "@/actions/comments";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";

export function CommentForm({ taskId }: { taskId: string }) {
  const [state, action, pending] = useActionState(addComment, {});

  return (
    <form action={action} className="space-y-2">
      <input type="hidden" name="taskId" value={taskId} />
      <Textarea name="body" placeholder="Write a comment…" rows={2} required maxLength={2000} />
      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? "Posting…" : "Post comment"}
      </Button>
    </form>
  );
}
