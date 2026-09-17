"use client";

import { addComents } from "@/actions/comments";
import { useActionState } from "react";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";

export function CommentForm({ taskId }: { taskId: string }) {
  const [state, action, pending] = useActionState(addComents, {});

  return (
    <form action={action} className="space-y-2">
      <input type="hidden" name="taskId" value={taskId} />
      <Textarea
        name="body"
        placeholder="Write a comment here ..."
        rows={2}
        maxLength={20000}
      />
      {state.error && <p className="text-sm text-destructive">{state.error}</p>}

      <Button type="submit" size="sm" disabled={pending}>
        {pending ? "Posting ..." : "Post Comment"}
      </Button>
    </form>
  );
}
